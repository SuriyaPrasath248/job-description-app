import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, db, signInWithPopup, doc, setDoc, updateDoc, arrayUnion, getDoc } from '../firebase/firebase';

const Login = () => {
  const navigate = useNavigate();
  const [isFirstUpload, setIsFirstUpload] = useState(true); // Track if this is the first upload
  const [conversationNumber, setConversationNumber] = useState(0); // Track conversation number

  // Format display name function for capitalization
  const formatUserName = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

 
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user data to Firestore
      await saveUserToFirestore(user);

      localStorage.setItem('userEmail', user.email);

      // Check ViewJDViewerBool
      const isJDViewerEnabled = localStorage.getItem('ViewJDViewerBool') === 'true';
      
      if (isJDViewerEnabled) {
        // If ViewJDViewerBool is true, navigate to JDViewer
        navigate('/jdviewer');
        
        // Reset the flag after navigation
        localStorage.removeItem('ViewJDViewerBool');
      } else {
        // Otherwise, proceed to intro page
        navigate('/intro');
      }
    } catch (error) {
      console.error("Error during sign-in process:", error);
    }
  };
  // Function to save user data to Firestore
  // Login.js

// Login.js

const saveUserToFirestore = async (user) => {
const formattedName = formatUserName(user.displayName);
const userDocRef = doc(db, 'ProjectBrainsReact', 'User', user.email, 'userdetails');
const userListDocRef = doc(db, 'ProjectBrainsReact', 'UserList', user.email, 'userdetails');
const emailArrayDocRef = doc(db, 'ProjectBrainsReact', 'UserList');

  const defaultUserData = {
    Useremail: user.email,
    Name: formattedName,
    ConversationNumber: 0,
    Credits: 5
  };
  const defaultUserSessionData = {
    ChatTranscript: true,
    UserConversationNo: 1
  };
  const defaultUserEmailData = {
    EmailId: user.email,
    displayName: formattedName
  };

  try {
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      console.log("New user detected. Setting default data.");
      await setDoc(userDocRef, defaultUserData);
      await setDoc(userListDocRef, defaultUserSessionData);
      await updateDoc(emailArrayDocRef, {
        email: arrayUnion(defaultUserEmailData)
      });
    } else {
      console.log("Existing user detected. Skipping default data setup.");
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
};


  
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      padding: '50px 0',
      background: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        width: 450,
        padding: '40px',
        background: '#F1F1F1',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
      }}>
        <div style={{
          position: 'relative',
          textAlign: 'center',
        }}>
          <div style={{
            color: '#323335',
            fontSize: '25px',
            fontFamily: 'Aspekta',
            fontWeight: '600',
          }}>Prodigy PB</div>
          <div style={{
            borderRadius: '50%',
            border: '2.46px #6E85F2 solid',
            width: '123px',
            height: '123px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
          }}>
            <img style={{
              width: '88px',
              height: '70px',
            }} src="https://via.placeholder.com/89x70" alt="Logo" />
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
        }}>
          <div onClick={handleGoogleSignIn} style={{
            width: '100%',
            maxWidth: '400px',
            padding: '15px',
            background: '#6E85F2',
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '22px',
            fontFamily: 'Inter',
            fontWeight: '600',
            cursor: 'pointer',
            border: '2px solid transparent',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5c74d4'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6E85F2'}
          >
            Sign in with Google
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
