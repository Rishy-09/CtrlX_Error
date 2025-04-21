import React from 'react';
import MainLayout from '../../components/layouts/MainLayout';

const TermsOfService = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Terms of Service</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Task Management System (the "Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, you should not use our Service.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              The Task Management System provides tools for managing tasks, tracking bugs, and collaborating with team members. The Service may include updates, enhancements, new features, and/or the addition of any new Web properties.
            </p>
            
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the Service, you may be required to register for an account. You agree to provide accurate and complete information when creating your account and to update your information to keep it accurate and complete.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols) with your account.
            </p>
            
            <h2>4. User Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.
            </p>
            
            <h2>5. Privacy Policy</h2>
            <p>
              Please refer to our Privacy Policy for information on how we collect, use, and disclose information from our users. You acknowledge and agree that your use of the Service is subject to our Privacy Policy.
            </p>
            
            <h2>6. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of the Task Management System and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
            
            <h2>7. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using the Service, or notify us that you wish to delete your account.
            </p>
            
            <h2>8. Limitation of Liability</h2>
            <p>
              In no event shall the Task Management System, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
            </p>
            
            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@taskmanagementsystem.com.
            </p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfService; 