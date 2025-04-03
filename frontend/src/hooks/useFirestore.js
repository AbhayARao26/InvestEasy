import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';

export const useFirestore = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Portfolio operations
  const getPortfolio = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      const portfolioRef = doc(db, 'portfolios', user.uid);
      const portfolioDoc = await getDoc(portfolioRef);
      
      if (!portfolioDoc.exists()) {
        // Create initial portfolio if it doesn't exist
        await setDoc(portfolioRef, { 
          stocks: [], 
          selectedStocks: [],
          goals: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return { stocks: [], selectedStocks: [], goals: null };
      }
      
      return portfolioDoc.data();
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolio = async (data) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const portfolioRef = doc(db, 'portfolios', user.uid);
      
      // Check if document exists
      const portfolioDoc = await getDoc(portfolioRef);
      
      if (!portfolioDoc.exists()) {
        // Create new portfolio document
        await setDoc(portfolioRef, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update existing portfolio document
        await updateDoc(portfolioRef, {
          ...data,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGoals = async (goals) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const portfolioRef = doc(db, 'portfolios', user.uid);
      await updateDoc(portfolioRef, { goals });
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Chat operations
  const getChatHistory = async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      setError(null);
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (title) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      const chatsRef = collection(db, 'chats');
      const newChat = {
        userId: user.uid,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(chatsRef, newChat);
      return {
        id: docRef.id,
        ...newChat
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateChat = async (chatId, messages) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        messages,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating chat:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const chatRef = doc(db, 'chats', chatId);
      await deleteDoc(chatRef);
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPortfolio,
    updatePortfolio,
    updateGoals,
    getChatHistory,
    createChat,
    updateChat,
    deleteChat
  };
}; 