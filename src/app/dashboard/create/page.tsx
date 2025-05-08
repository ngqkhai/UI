"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Link,
  Type,
  Upload,
  Languages,
  Mic,
  Palette,
  ArrowLeft,
  Loader2,
} from "lucide-react";

type InputMethod = "script" | "file" | "url";

const languages = [
  { code: "en", name: "English" },
  { code: "vi", name: "Vietnamese" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
];

const voices = [
  { id: "en-1", name: "Emma (Female)", language: "en" },
  { id: "en-2", name: "James (Male)", language: "en" },
  { id: "vi-1", name: "Mai (Female)", language: "vi" },
  { id: "vi-2", name: "Nam (Male)", language: "vi" },
];

const styles = [
  { id: "educational", name: "Educational", description: "Clear and professional tone" },
  { id: "casual", name: "Casual", description: "Friendly and conversational" },
  { id: "scientific", name: "Scientific", description: "Technical and precise" },
  { id: "storytelling", name: "Storytelling", description: "Narrative and engaging" },
];

export default function CreateVideo() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inputMethod, setInputMethod] = useState<InputMethod>("script");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedVoice, setSelectedVoice] = useState("en-1");
  const [selectedStyle, setSelectedStyle] = useState("educational");
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement video creation logic
    setTimeout(() => setIsLoading(false), 2000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Create New Video</h1>
          <p className="text-gray-600 mt-2">
            Choose your input method and customize your video settings
          </p>
        </motion.div>

        <motion.form
          variants={container}
          initial="hidden"
          animate="show"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Input Method Selection */}
          <motion.div variants={item} className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Input Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setInputMethod("script")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  inputMethod === "script"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <Type className="w-6 h-6 mb-2 text-primary" />
                <h3 className="font-medium">Script</h3>
                <p className="text-sm text-gray-600">Write or paste your script</p>
              </button>

              <button
                type="button"
                onClick={() => setInputMethod("file")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  inputMethod === "file"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <FileText className="w-6 h-6 mb-2 text-primary" />
                <h3 className="font-medium">File Upload</h3>
                <p className="text-sm text-gray-600">Upload DOCX or PDF</p>
              </button>

              <button
                type="button"
                onClick={() => setInputMethod("url")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  inputMethod === "url"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <Link className="w-6 h-6 mb-2 text-primary" />
                <h3 className="font-medium">URL</h3>
                <p className="text-sm text-gray-600">Import from webpage</p>
              </button>
            </div>
          </motion.div>

          {/* Input Content */}
          <motion.div variants={item} className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Content</h2>
            {inputMethod === "script" && (
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Write or paste your script here..."
                className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            )}

            {inputMethod === "file" && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Drag and drop your file here</p>
                <p className="text-sm text-gray-500">or</p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: DOCX, PDF (max 10MB)
                </p>
              </div>
            )}

            {inputMethod === "url" && (
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter webpage URL..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            )}
          </motion.div>

          {/* Customization Options */}
          <motion.div variants={item} className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Customization</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Language Selection */}
              <div>
                <label className="flex items-center text-gray-700 mb-2">
                  <Languages className="w-5 h-5 mr-2 text-primary" />
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="flex items-center text-gray-700 mb-2">
                  <Mic className="w-5 h-5 mr-2 text-primary" />
                  Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {voices
                    .filter((voice) => voice.language === selectedLanguage)
                    .map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Style Selection */}
              <div>
                <label className="flex items-center text-gray-700 mb-2">
                  <Palette className="w-5 h-5 mr-2 text-primary" />
                  Style
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {styles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={item} className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Video"
              )}
            </button>
          </motion.div>
        </motion.form>
      </div>
    </main>
  );
} 