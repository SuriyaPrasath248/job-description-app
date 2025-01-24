import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import axios from 'axios';
import '../pages/ChatInterface.css';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
  console.log("Initializing Chat Interface Component");

  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [precontext, setPrecontext] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [jdPopup, setJdPopup] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [firebasePrompts, setFirebasePrompts] = useState({});
  const [finalConfirmPopup, setFinalConfirmPopup] = useState(false);
  const [conversationNumber, setConversationNumber] = useState(1);
  const [chatTranscript, setChatTranscript] = useState(false);
  const [isFirstUpload, setIsFirstUpload] = useState(true);
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;


  const db = getFirestore();

  useEffect(() => {
    console.log("Executing useEffect for initial setup");

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      console.log(`User logged in: ${user.email}`);
      setUserName(user.displayName || 'there');
    }

    const fetchPrompts = async () => {
      try {
        console.log("Fetching prompts from Firestore");
        const docRef = doc(db, 'Project Brains', 'Admin');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Prompts found in Firestore:", docSnap.data());
          const adminData = docSnap.data();
          setPrecontext(adminData.InteractionPrompt);
          setFirebasePrompts({
            JDSupplement: adminData.JDSupplement,
            ResultsPrompt: adminData.ResultsPrompt,
            MiscPrompt: adminData.MiscPrompt,
          });
        } else {
          console.warn("No prompts found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching prompts:", error);
      }
    };

    const fetchUserConversation = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        console.log(`Fetching conversation data for user: ${userEmail}`);
        
        const userRef = doc(db, 'ProjectBrainsReact', 'User', userEmail, 'userdetails');
        const userDocSnap = await getDoc(userRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("User data fetched from Firestore:", userData);
          setConversationNumber(userData.ConversationNumber || 1);
          setChatTranscript(userData.ChatTranscript || false);
        } else {
          console.log("No conversation data found, initializing new conversation");
          await setDoc(userRef, { ConversationNumber: 1, ChatTranscript: false }, { merge: true });
          setConversationNumber(1);
          setChatTranscript(false);
        }
      } catch (error) {
        console.error("Error fetching user conversation data:", error);
      }
    };

    fetchPrompts();
    fetchUserConversation();
  }, [db]);

 

  async function uploadChat(prompt, response) {
    const db = getFirestore();
    const userEmail = localStorage.getItem('userEmail');
    
    let conversationNumber = localStorage.getItem('conversationNumber');
    if (!conversationNumber) {
          let conversationNumber = localStorage.getItem('conversationNumber');
           console.warn("Conversation number not found in localStorage.");
       }
    console.log("Using conversationNumber:", conversationNumber);
    console.log("Loaded conversationNumber from localStorage:", conversationNumber);
  
    const conversationPath = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversationNumber}`;
    const chatHistoryPath = `${conversationPath}/Transcript/ChatHistory`;
  
    console.log("Current Conversation Path:", conversationPath);
  
    try {
      // Set up the main conversation document
      const conversationDocRef = doc(db, conversationPath);
      const conversationSnap = await getDoc(conversationDocRef);
  
      // Check if conversation document exists; if not, create it
      if (!conversationSnap.exists()) {
        console.log("Creating a new conversation document:", conversationPath);
  
        const conversationData = {
          LinkCreated: "",
          JDCreated: "",
          SharedBy: [],
          ViewedBy: [],
          Timestamp: new Date().toISOString().split("T")[0],
          SessionFeedback: 0, // Default feedback value
          AdditionalFeedback: "" // Default empty feedback
        };
        
        await setDoc(conversationDocRef, conversationData);
  
        const chatHistoryRef = doc(db, chatHistoryPath);
        await setDoc(chatHistoryRef, { Chat: [] }); // Initialize empty chat array
      }
  
      // Update chat history with new message
      const chatHistoryRef = doc(db, chatHistoryPath);
      await updateDoc(chatHistoryRef, {
        Chat: arrayUnion({ Prompt: prompt, Response: response })
      });
  
      console.log("Chat uploaded successfully.");
  
      // Update localStorage to ensure conversationNumber is correct in subsequent calls
      localStorage.setItem('conversationNumber', conversationNumber);
    } catch (error) {
      console.error("Error in uploading chat:", error);
    }
  }
  
  
  
  
   // Function to handle sending the user's message to the API
const handleSendMessage = async () => {
  console.log("User initiated message send");

  if (userMessage.trim()) {
    setLoading(true);
    const updatedChatHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(updatedChatHistory);
    
    try {
      console.log("Sending request to OpenAI API with precontext and user message");
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: precontext },
            ...updatedChatHistory
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
            
            
          }
        }
      );
      
      const aiResponse = response.data.choices[0].message.content;
      console.log("Received response from OpenAI:", aiResponse);

      const newChatHistory = [...updatedChatHistory, { role: 'assistant', content: aiResponse }];
      setChatHistory(newChatHistory);
      setLoading(false);
      setUserMessage('');
      await uploadChat(userMessage, aiResponse);
      
    } catch (error) {
      console.error("Error fetching response from OpenAI:", error);
      setLoading(false);
    }
  }
};

// Function to generate the job description based on chat history
const generateJobDescription = async () => {
  console.log("User requested JD generation");

  setLoading(true);
  const { JDSupplement, ResultsPrompt, MiscPrompt } = firebasePrompts;

  const promptMessages = [
    { role: 'system', content: precontext },
    ...chatHistory,
    { role: 'user', content: `Generate a job description using these prompts: ${JDSupplement}, ${ResultsPrompt}, ${MiscPrompt}` }
  ];

  try {
    console.log("Sending job description generation request to OpenAI");
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: promptMessages,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
          
          
        }
      }
    );

    const generatedJD = response.data.choices[0].message.content;
    setJobDescription(generatedJD);
    setJdPopup(true);
    console.log("JD generated and popup displayed");
    setLoading(false);

  } catch (error) {
    console.error("Error generating job description:", error);
    setLoading(false);
  }
};

// Function to format job description with HTML formatting
const formatJobDescription = (jd) => {
  console.log("Formatting JD content for display");
  if (!jd) return ''; // Handle undefined jd to avoid errors
  return jd
    .replace(/(?:\s*-\s*)/g, '<br> • ')
    .replace(/\n/g, '<br>')
    .replace(/(Job Opportunity:)/g, '<strong>$1</strong>')
    .replace(/(Location:|Role Summary:|Key Responsibilities:|Required Skills & Qualifications:|Benefits:)/g, '<strong>$1</strong>');
};

  

  const handleFinalize = () => {
    console.log("Finalizing JD generation");
    setJdPopup(false);
    setFinalConfirmPopup(true);
  };

  const handleFinalConfirmation = async () => {
    console.log("Final confirmation initiated.");
    const userEmail = localStorage.getItem('userEmail');
    const conversationNumber = localStorage.getItem('conversationNumber') || 1;

    const conversationPath = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversationNumber}`;
    const userListPath = `ProjectBrainsReact/UserList/${userEmail}/userdetails`;

    try {
        const conversationRef = doc(db, conversationPath);
        await updateDoc(conversationRef, { JDCreated: jobDescription });
        const userRef = doc(db, userListPath);
        await updateDoc(userRef, { ChatTranscript: true });
        localStorage.setItem('generatedJD', jobDescription);
        setFinalConfirmPopup(false);
        navigate('/JobDescription');
    } catch (error) {
        console.error("Error during final confirmation process:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <div className="back-button">
          <img className="back-icon" alt="back" />
        </div>
        <div className="header-title">Hi, {userName}</div>
        <img className="header-logo" alt="logo" />
      </div>

      <div className="content-wrapper">
        <div className="chat-box">
          <div className="chat-messages">
            {chatHistory.map((message, index) => (
              <div key={index} className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}>
                {message.content}
              </div>
            ))}
          </div>

          <div className="message-input">
            <input
              type="text"
              className="input-box"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="What should your J.D. look like? Tell us"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <button onClick={handleSendMessage} disabled={loading} className="send-button">
              {loading ? 'Loading...' : 'Send'}
            </button>
          </div>
        </div>

        <div className="job-role-box">
          <h2>Job Role</h2>
          <p>Your J.D. will appear here after you generate a job description.</p>
          <button onClick={generateJobDescription} disabled={loading} className="generate-jd-button">
            {loading ? 'Loading...' : 'Generate Job Description'}
          </button>
        </div>
      </div>

      {/* JD Popup */}
      {jdPopup && (
        <div className="jd-popup">
          <div className="jd-content">
            <h2>Generated Job Description</h2>
            <div className="jd-scrollable-content">
              <p dangerouslySetInnerHTML={{ __html: formatJobDescription(jobDescription) }}></p>
            </div>
            <div className="popup-buttons">
              <button onClick={() => setJdPopup(false)} className="refine-button">Refine</button>
              <button onClick={handleFinalize} className="finalize-button">Finalize</button>
            </div>
          </div>
        </div>
      )}

      {/* Final Confirmation Popup */}
      {finalConfirmPopup && (
        <div className="final-popup">
          <div className="popup-content">
            <p>Are you sure you want to finalize? You will not be able to make further changes.</p>
            <div className="popup-buttons">
              <button onClick={() => setFinalConfirmPopup(false)} className="go-back-button">Go Back</button>
              <button onClick={handleFinalConfirmation} className="confirm-finalize-button">Finalize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
