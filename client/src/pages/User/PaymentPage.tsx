import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/apiService';
import axiosInstance from '../../services/apiService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BeatLoader from 'react-spinners/BeatLoader';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: number;
  thumbnail: string;
  instructor: {
    name: string;
    email: string;
  };
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(location.state?.course || null);
  const [loading, setLoading] = useState(!location.state?.course);

  useEffect(() => {
    if (!course && courseId) {
      setLoading(true);
      axiosInstance.get(`/api/users/courses/${courseId}`)
        .then(res => setCourse(res.data as Course))
        .catch(() => setCourse(null))
        .then(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <BeatLoader color="#7e22ce" size={30} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-lg text-gray-600">No course details found.</div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleRazorpayPayment = async () => {
    try {
      // 1. Create order on backend
      const amountInPaise = Math.round(course.price * 100);
      const { data } = await createRazorpayOrder(amountInPaise, course._id);
      const { orderId, amount, currency } = data as any;

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'EduRise',
        description: course.title,
        image: '/vite.svg',
        order_id: orderId,
        handler: async function (response: any) {
          // 3. Verify payment on backend and enroll user
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
          const verifyRes = await verifyRazorpayPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            course._id,
            course.price
          );
          if ((verifyRes.data as any).success) {
            alert('Payment Success! You are now enrolled.');
            // Force reload to update enrollment status button
            window.location.href = `/courses/${course._id}`;
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          email: localStorage.getItem('userEmail') || '',
        },
        theme: {
          color: '#7e22ce',
        },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Failed to initiate payment.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-20">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Course Payment</h2>
          <div className="mb-4">
            <div className="font-semibold text-lg text-purple-700 mb-1">{course.title}</div>
            <div className="text-gray-600 mb-2">{course.description}</div>
            <div className="text-gray-800 font-medium">Amount to Pay: <span className="text-purple-700">₹{course.price}</span></div>
          </div>
          <button
            onClick={handleRazorpayPayment}
            className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition"
          >
            Pay with Razorpay
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage; 