// Send a message
const sendMessage = async (chatId, content, attachmentFiles = null) => {
  // Prevent duplicate sends
  if (sendingMessage) return null;
  
  // Validate MongoDB ID format
  const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(chatId);
  if (!isValidMongoId) {
    console.error('Invalid chat ID format in sendMessage:', chatId);
    toast.error('Invalid chat ID format');
    return null;
  }
  
  setSendingMessage(true);
  try {
    let formData;
    
    // Check if content is already FormData (direct pass from ChatInput)
    if (content instanceof FormData) {
      formData = content;
      console.log('Using pre-created FormData from component');
    } else {
      // Create new FormData and populate it
      formData = new FormData();
      
      // Add content (may be empty if only attachments)
      const trimmedContent = (content || '').trim();
      formData.append('content', trimmedContent);
      
      // Add attachments if provided
      if (attachmentFiles && Array.isArray(attachmentFiles) && attachmentFiles.length > 0) {
        for (let i = 0; i < attachmentFiles.length; i++) {
          if (attachmentFiles[i] instanceof File || attachmentFiles[i] instanceof Blob) {
            formData.append('attachments', attachmentFiles[i]);
            console.log('Adding attachment:', attachmentFiles[i].name, attachmentFiles[i].size);
          } else {
            console.error('Invalid attachment type:', typeof attachmentFiles[i]);
          }
        }
      }
    }
    
    console.log('Sending message to API');
    
    const response = await axiosInstance.post(`/api/chats/${chatId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Update the messages list with the new message
    setMessages(prevMessages => [...prevMessages, response.data]);
    
    // Update unread count if needed
    if (activeChat && activeChat._id === chatId) {
      fetchChats(); // Update chat list to refresh unread counts
    }
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        toast.error('Chat not found or has been deleted');
      } else if (error.response.status === 403) {
        toast.error('You do not have permission to send messages in this chat');
      } else if (error.response.status === 413) {
        toast.error('File(s) too large. Maximum file size is 10MB');
      } else if (error.response.status === 400) {
        toast.error(error.response.data?.message || 'Invalid message format. Please try again.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
    
    return null;
  } finally {
    setSendingMessage(false);
  }
}; 