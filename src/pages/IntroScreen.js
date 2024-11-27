import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const IntroScreen = () => {
  const [introTitle, setIntroTitle] = useState('');
  const [introMessage, setIntroMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [credits, setCredits] = useState(3); // default credits
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const docRef = doc(db, 'Project Brains', 'Admin');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const adminData = docSnap.data();
          setIntroTitle(adminData.IntroTitle || 'Introduction');
          setIntroMessage(adminData.InteractionPrompt);
          localStorage.setItem('InteractionPrompt', adminData.InteractionPrompt);
        } else {
          console.log('No admin document found.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    const fetchUserEmail = () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
      } else {
        console.log('No email found in localStorage');
      }
    };

    fetchAdminData();
    fetchUserEmail();
  }, []);

  // Inside handleProceed function in IntroScreen.js

const handleProceed = async () => {
  console.log("Proceed button clicked");

  if (!userEmail) {
    console.log("User email not found in localStorage");
    return;
  }

  try {
    const userDetailsRef = doc(db, 'ProjectBrainsReact', 'User', userEmail, 'userdetails');
    const userDetailsSnap = await getDoc(userDetailsRef);

    if (userDetailsSnap.exists()) {
      const userDetails = userDetailsSnap.data();
      console.log("User details fetched:", userDetails);

      // Check if `ChatTranscript` is `false` to determine if we should continue without incrementing conversation
      if (userDetails.Credits > 0) {
        const userHistoryRef = doc(db, 'ProjectBrainsReact', 'UserList', userEmail, 'userdetails');
        const userHistorySnap = await getDoc(userHistoryRef);

        if (userHistorySnap.exists()) {
          const userHistory = userHistorySnap.data();

          if (!userHistory.ChatTranscript) {
            console.log("Ongoing conversation detected. Continuing without incrementing conversation number.");
            navigate('/chat');
          } else {
            console.log("Starting new conversation session.");
            userDetails.ConversationNumber += 1;
            userDetails.Credits -= 1;
            await setDoc(userDetailsRef, userDetails);

            userHistory.UserConversationNo = userDetails.ConversationNumber;
            userHistory.ChatTranscript = false;
            await setDoc(userHistoryRef, userHistory);

            console.log("User details and history updated for new conversation session.");
            localStorage.setItem('conversationNumber', userDetails.ConversationNumber);
            navigate('/chat');
          }
        }
      } else {
        console.log("No credits available to start a new conversation.");
      }
    }
  } catch (error) {
    console.error("Error during proceed:", error);
  }
};



  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{width: '1920px', height: '1080px', position: 'relative', background: 'white'}}>
      <div style={{left: '56px', top: '135.5px', position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '40px', display: 'inline-flex'}}>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '24px', display: 'flex'}}>
          <div style={{color: '#323335', fontSize: '24px', fontFamily: 'Aspekta', fontWeight: '700', wordWrap: 'break-word'}}>{introTitle}</div>
          <div style={{width: '822px', height: '654px', color: '#323335', fontSize: '20px', fontFamily: 'Aspekta', fontWeight: '500', lineHeight: '32px', wordWrap: 'break-word'}}>
            {introMessage}
          </div>
        </div>
        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: '22px', display: 'inline-flex'}}>
          <div style={{
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingTop: '16px',
            paddingBottom: '16px',
            background: '#6E85F2',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '2px solid',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '8px',
            display: 'flex',
            cursor: 'pointer',
            color: 'white',
            fontSize: '18px',
            fontFamily: 'Inter',
            fontWeight: '600',
            lineHeight: '24px',
          }}
            onClick={handleProceed}
          >
            Proceed
          </div>
          <div style={{color: '#323335', fontSize: '20px', fontFamily: 'Aspekta', fontWeight: '500', lineHeight: '32px', wordWrap: 'break-word'}}>
            ({credits} Credits Left)
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
