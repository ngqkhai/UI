"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Video, 
  BarChart3, 
  Clock, 
  PlusCircle, 
  Settings, 
  LogOut,
  User,
  Bell
} from "lucide-react";
import { useProfile } from "@/components/ProfileContext";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { profile, setProfile } = useProfile();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.accessToken || profile) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch("https://auth-tkpm.vercel.app/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [session?.user?.accessToken, setProfile, profile]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Science Creator</h1>
              <div className="hidden md:flex space-x-4">
                <button className="px-4 py-2 text-gray-600 hover:text-primary transition-colors">
                  Dashboard
                </button>
                <button className="px-4 py-2 text-gray-600 hover:text-primary transition-colors">
                  Projects
                </button>
                <button className="px-4 py-2 text-gray-600 hover:text-primary transition-colors">
                  Analytics
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-primary cursor-pointer"
                    onClick={() => router.push('/dashboard/profile')}
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer"
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800">
            {(() => {
              const username = profile?.username || session.user?.username || "";
              return `Welcome back, ${username}! 👋`;
            })()}
          </h2>
          <p className="text-gray-600 mt-2">
            Create amazing science videos with AI assistance
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={item} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Video className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">0</h3>
            <p className="text-gray-600 text-sm">Videos Created</p>
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-sm text-gray-500">Views</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">0</h3>
            <p className="text-gray-600 text-sm">Total Views</p>
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm text-gray-500">Time</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">0h</h3>
            <p className="text-gray-600 text-sm">Content Duration</p>
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Settings className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-sm text-gray-500">Status</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Active</h3>
            <p className="text-gray-600 text-sm">Account Status</p>
          </motion.div>
        </motion.div>

        {/* Create New Video Card */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div
            variants={item}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Video</h3>
            <p className="text-gray-600 mb-6">
              Start creating your next science video with AI assistance. Choose your topic, style, and let our AI help you create engaging content.
            </p>
            <button 
              onClick={() => router.push('/dashboard/create')}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Video
            </button>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="p-1 bg-green-100 rounded-full mr-3 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-gray-600">Keep videos under 10 minutes for better engagement</span>
              </li>
              <li className="flex items-start">
                <div className="p-1 bg-blue-100 rounded-full mr-3 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </div>
                <span className="text-gray-600">Use clear, simple language to explain complex concepts</span>
              </li>
              <li className="flex items-start">
                <div className="p-1 bg-purple-100 rounded-full mr-3 mt-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                </div>
                <span className="text-gray-600">Add visual aids to support your explanations</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
} 