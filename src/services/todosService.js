import { 
  db, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from '../firebase';

// 訂閱某清單內的所有待辦事項 (即時同步 Firestore)
export const subscribeTodos = (listId, callback) => {
  if (!db || !listId) {
    callback([]);
    return () => {};
  }

  const todosRef = collection(db, 'lists', listId, 'todos');
  const q = query(todosRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(items);
  }, (error) => {
    console.error(`Error subscribing to todos for list ${listId}:`, error);
    callback([]);
  });
};

// 新增待辦事項
export const addTodo = async (listId, { title, description = '', priority = 'medium', dueDate = null, assignedTo = null }, currentUser) => {
  if (!db || !listId || !currentUser) throw new Error('Database, listId, or user not available');

  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error('待辦事項標題不可為空');

  const todoData = {
    title: cleanTitle,
    description: description.trim(),
    priority, // 'low' | 'medium' | 'high'
    dueDate: dueDate || null,
    completed: false,
    completedAt: null,
    completedBy: null,
    assignedTo: assignedTo ? {
      uid: assignedTo.uid || '',
      displayName: assignedTo.displayName || '',
      email: assignedTo.email || '',
      photoURL: assignedTo.photoURL || ''
    } : null,
    createdBy: {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Anonymous',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || ''
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'lists', listId, 'todos'), todoData);
  return { id: docRef.id, ...todoData };
};

// 切換待辦完成狀態
export const toggleTodo = async (listId, todoId, currentCompleted, currentUser) => {
  if (!db || !listId || !todoId) throw new Error('Database, listId, or todoId not available');

  const todoRef = doc(db, 'lists', listId, 'todos', todoId);
  const nextCompleted = !currentCompleted;

  await updateDoc(todoRef, {
    completed: nextCompleted,
    completedAt: nextCompleted ? serverTimestamp() : null,
    completedBy: nextCompleted ? {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Anonymous',
      photoURL: currentUser.photoURL || ''
    } : null,
    updatedAt: serverTimestamp()
  });
};

// 更新待辦內容 (標題、描述、優先級、到期日、指派人)
export const updateTodo = async (listId, todoId, updates) => {
  if (!db || !listId || !todoId) throw new Error('Database, listId, or todoId not available');

  const todoRef = doc(db, 'lists', listId, 'todos', todoId);
  await updateDoc(todoRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// 刪除待辦事項
export const deleteTodo = async (listId, todoId) => {
  if (!db || !listId || !todoId) throw new Error('Database, listId, or todoId not available');

  const todoRef = doc(db, 'lists', listId, 'todos', todoId);
  await deleteDoc(todoRef);
};

// 批次清除已完成的項目
export const clearCompletedTodos = async (listId, todos) => {
  if (!db || !listId || !todos) return;

  const completedTodos = todos.filter(t => t.completed);
  const promises = completedTodos.map(t => deleteDoc(doc(db, 'lists', listId, 'todos', t.id)));
  await Promise.all(promises);
};
