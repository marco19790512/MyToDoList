import { 
  db, 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from '../firebase';

const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 訂閱使用者參與的所有清單 (包含自己建立的與受邀協作的)
export const subscribeUserLists = (currentUser, callback) => {
  if (!db || !currentUser) {
    callback([]);
    return () => {};
  }

  const listsRef = collection(db, 'lists');
  // 查詢使用者為成員的清單
  const q = query(
    listsRef, 
    where('memberUids', 'array_contains', currentUser.uid)
  );

  return onSnapshot(q, async (snapshot) => {
    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 若使用者完全沒有任何清單，自動建立一個預設個人清單
    if (lists.length === 0 && !snapshot.metadata.hasPendingWrites) {
      try {
        await createList({
          name: '個人待辦',
          description: '歡迎使用 MyToDoList！點擊可新增任務或分享給好友協作。',
          color: 'indigo',
          icon: 'check-square',
          currentUser
        });
      } catch (e) {
        console.error('Error creating initial list:', e);
      }
    }

    // 依建立時間排序
    lists.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    callback(lists);
  }, (error) => {
    console.error('Error subscribing to lists:', error);
    callback([]);
  });
};

// 建立新清單
export const createList = async ({ name, description = '', color = 'indigo', icon = 'list', currentUser }) => {
  if (!db || !currentUser) throw new Error('Database or user not available');

  const shareCode = generateShareCode();
  const listData = {
    name: name.trim(),
    description: description.trim(),
    color,
    icon,
    shareCode,
    ownerId: currentUser.uid,
    ownerName: currentUser.displayName || 'Anonymous',
    ownerEmail: currentUser.email || '',
    ownerPhoto: currentUser.photoURL || '',
    memberUids: [currentUser.uid],
    memberEmails: currentUser.email ? [currentUser.email.toLowerCase()] : [],
    members: [{
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Anonymous',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || '',
      role: 'owner'
    }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'lists'), listData);
  return { id: docRef.id, ...listData };
};

// 透過 6 碼分享碼加入協作清單
export const joinListByCode = async (code, currentUser) => {
  if (!db || !currentUser) throw new Error('Database or user not available');
  const cleanCode = code.trim().toUpperCase();

  const listsRef = collection(db, 'lists');
  const q = query(listsRef, where('shareCode', '==', cleanCode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('找不到此邀請代碼對應的清單，請確認代碼是否正確。');
  }

  const listDoc = snapshot.docs[0];
  const listData = listDoc.data();

  // 若已經是成員，直接返回清單
  if (listData.memberUids?.includes(currentUser.uid)) {
    return { id: listDoc.id, ...listData, alreadyMember: true };
  }

  // 加入新成員
  const newMember = {
    uid: currentUser.uid,
    displayName: currentUser.displayName || 'Anonymous',
    email: currentUser.email || '',
    photoURL: currentUser.photoURL || '',
    role: 'collaborator'
  };

  await updateDoc(doc(db, 'lists', listDoc.id), {
    memberUids: arrayUnion(currentUser.uid),
    memberEmails: currentUser.email ? arrayUnion(currentUser.email.toLowerCase()) : listData.memberEmails || [],
    members: arrayUnion(newMember),
    updatedAt: serverTimestamp()
  });

  return { id: listDoc.id, ...listData, alreadyMember: false };
};

// 邀請使用者 Email 加入清單
export const inviteMemberByEmail = async (listId, email, currentUser) => {
  if (!db) throw new Error('Database not available');
  const cleanEmail = email.trim().toLowerCase();

  const listRef = doc(db, 'lists', listId);
  const snap = await getDoc(listRef);
  if (!snap.exists()) throw new Error('清單不存在');

  await updateDoc(listRef, {
    memberEmails: arrayUnion(cleanEmail),
    updatedAt: serverTimestamp()
  });

  return true;
};

// 退出清單 (若不是擁有者)
export const leaveList = async (listId, currentUser) => {
  if (!db || !currentUser) throw new Error('Database or user not available');
  const listRef = doc(db, 'lists', listId);
  const snap = await getDoc(listRef);
  if (!snap.exists()) return;

  const data = snap.data();
  if (data.ownerId === currentUser.uid) {
    throw new Error('您是清單建立者，無法退出。若不需要可直接刪除此清單。');
  }

  const updatedMembers = (data.members || []).filter(m => m.uid !== currentUser.uid);

  await updateDoc(listRef, {
    memberUids: arrayRemove(currentUser.uid),
    memberEmails: currentUser.email ? arrayRemove(currentUser.email.toLowerCase()) : data.memberEmails || [],
    members: updatedMembers,
    updatedAt: serverTimestamp()
  });
};

// 刪除清單 (僅擁有者能刪除)
export const deleteList = async (listId, currentUser) => {
  if (!db || !currentUser) throw new Error('Database or user not available');
  const listRef = doc(db, 'lists', listId);
  const snap = await getDoc(listRef);
  if (!snap.exists()) return;

  const data = snap.data();
  if (data.ownerId !== currentUser.uid) {
    throw new Error('只有清單建立者才能刪除此清單。');
  }

  // 刪除 subcollection todos
  const todosSnap = await getDocs(collection(db, 'lists', listId, 'todos'));
  const batchDeletes = todosSnap.docs.map(tDoc => deleteDoc(doc(db, 'lists', listId, 'todos', tDoc.id)));
  await Promise.all(batchDeletes);

  // 刪除清單本體
  await deleteDoc(listRef);
};
