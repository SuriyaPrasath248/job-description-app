import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const JDViewer = () => {
  const [jobDescription, setJobDescription] = useState('No description available');
  const db = getFirestore();

  useEffect(() => {
    const fetchJobDescription = async () => {
      const sharedEmail = localStorage.getItem('sharedEmail');
      const sharedConversationNumber = localStorage.getItem('sharedConversationNumber');

      if (!sharedEmail || !sharedConversationNumber) {
        console.error('Missing sharedEmail or sharedConversationNumber in localStorage');
        return;
      }

      try {
        console.log(`Fetching JD for: ProjectBrainsReact/User/${sharedEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`);
        const docRef = doc(db, `ProjectBrainsReact/User/${sharedEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setJobDescription(docSnap.data().JDCreated || 'No description available');
        } else {
          console.error('No such document found!');
        }
      } catch (error) {
        console.error('Error fetching job description:', error);
      }
    };

    fetchJobDescription();
  }, [db]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Job Description Viewer</h1>
      <p>{jobDescription}</p>
    </div>
  );
};

export default JDViewer;
