import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './JDViewer.css';

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
    <div className="jdviewer-container">
      <div className="jdviewer-header">
        <h1 className="jdviewer-title">Job Description</h1>
        <div className="jdviewer-buttons">
          <button className="jdviewer-share-button">Share</button>
          <button className="jdviewer-create-button">Create New</button>
        </div>
      </div>
      <div className="jdviewer-content">
        <div className="jdviewer-scrollable">
          <pre>{jobDescription}</pre>
        </div>
      </div>
    </div>
  );
};

export default JDViewer;
