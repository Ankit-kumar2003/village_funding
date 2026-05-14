import { Link } from 'react-router-dom';

export default function ThankYou() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border border-gray-100 text-center">
        <div className="w-20 h-20 bg-green-100 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-heading font-bold text-primary mb-4">Thank You!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your contribution has been successfully submitted. It is currently <span className="font-bold text-orange-500">PENDING</span> review. 
          Once the village treasurer verifies the UTR/Transaction ID with the bank statement, it will be marked as APPROVED and added to the campaign total.
        </p>
        
        <div className="space-y-4">
          <Link to="/dashboard" className="block w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium">
            Go to My Dashboard
          </Link>
          <Link to="/campaigns" className="block w-full bg-white text-gray-700 border border-gray-300 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium">
            Explore More Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
