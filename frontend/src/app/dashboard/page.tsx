"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";
import {
  FileText,
  Brain,
  Target,
  Upload,
  LogOut,
  AlertCircle,
  Loader2,
  ChevronRight,
  Clock,
  File,
} from "lucide-react";
import { getToken, getUser, logout } from "@/lib/auth";

interface IGenerationItem {
  _id: string;
  userGivenName?: string;
  generationType: string;
  fileName: string;
  uploadDate: string;
  originalFileUrl?: string;
}

interface IDashboardStats {
  total: number;
  completed: number;
  processing: number;
  thisMonth: number;
}

const getGenerationIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "summary":
      return FileText;
    case "flashcards":
      return Brain;
    case "key_points":
      return Target;
    default:
      return FileText;
  }
};

const getGenerationColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "summary":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/50",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
      };
    case "flashcards":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/50",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-700 dark:text-purple-300",
      };
    case "key_points":
      return {
        bg: "bg-green-50 dark:bg-green-950/50",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-700 dark:text-green-300",
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-900/50",
        border: "border-gray-200 dark:border-gray-700",
        text: "text-gray-700 dark:text-gray-300",
      };
  }
};

export default function DashboardPage() {
  const router = useRouter();

  const [generations, setGenerations] = useState<IGenerationItem[]>([]);
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/signin");
      return;
    }
    async function fetchGenerationsAndStats() {
      setIsLoading(true);
      setError(null);
      try {
        const user = getUser();
        const userId = user?.id;
        if (!userId) throw new Error("User ID not found in local storage.");
        const [genRes, statsRes] = await Promise.all([
          fetch(`http://localhost:5000/generations-list?userId=${userId}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          fetch(`http://localhost:5000/dashboard-stats?userId=${userId}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);
        if (!genRes.ok) throw new Error("Failed to fetch generations.");
        if (!statsRes.ok) throw new Error("Failed to fetch dashboard stats.");
        const data = await genRes.json();
        const statsData = await statsRes.json();
        setGenerations(data.generations);
        setStats(statsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchGenerationsAndStats();
  }, [router]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900 rounded-full blur-3xl opacity-60 animate-pulse z-0" />
        <div className="flex flex-col items-center space-y-4 z-10">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="text-xl font-medium text-gray-900 dark:text-white">
            Loading user...
          </p>
        </div>
      </div>
    );
  }

  if (error === "Unauthorized" || error === "No token provided.") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900 rounded-full blur-3xl opacity-60 animate-pulse z-0" />
        <div className="flex flex-col items-center space-y-4 z-10">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          <p className="text-xl font-medium text-red-600 dark:text-red-400">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  const filteredGenerations = generations.filter((gen) => {
    const searchLower = search.toLowerCase();
    return (
      (gen.userGivenName &&
        gen.userGivenName.toLowerCase().includes(searchLower)) ||
      (gen.generationType &&
        gen.generationType.toLowerCase().includes(searchLower)) ||
      (gen.fileName && gen.fileName.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 overflow-x-hidden">
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900 rounded-full blur-3xl opacity-60 animate-pulse z-0" />

      <header className="relative z-20 w-full py-6 px-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          prefetch={false}
        >
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-white transition-colors">
            Tanay Sachdeva
          </span>
        </Link>
        <Button
          onClick={() => {
            logout();
            router.push("/auth/signin");
          }}
          variant="outline"
          className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-4 flex flex-col items-center">
                <div className="text-blue-600 bg-blue-100 rounded-full p-2 mb-2">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-gray-500 text-sm mt-1">Total Jobs</div>
              </Card>
              <Card className="p-4 flex flex-col items-center">
                <div className="text-green-600 bg-green-100 rounded-full p-2 mb-2">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-gray-500 text-sm mt-1">Completed</div>
              </Card>
              <Card className="p-4 flex flex-col items-center">
                <div className="text-orange-600 bg-orange-100 rounded-full p-2 mb-2">
                  <Target className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.processing}</div>
                <div className="text-gray-500 text-sm mt-1">Processing</div>
              </Card>
              <Card className="p-4 flex flex-col items-center">
                <div className="text-purple-600 bg-purple-100 rounded-full p-2 mb-2">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
                <div className="text-gray-500 text-sm mt-1">This Month</div>
              </Card>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Your Generated Content
            </h1>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="border-0 shadow-md bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm h-[200px]"
                >
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-1/2 rounded-lg" />
                      <Skeleton className="h-4 w-2/3 rounded-lg" />
                      <Skeleton className="h-4 w-1/3 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && !isLoading && (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && filteredGenerations.length === 0 && (
            <div className="text-center py-16 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-950/50 rounded-full mb-6">
                <File className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                No generated content yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Upload a file to start generating summaries, flashcards, or key
                points from your documents.
              </p>
              <Link href="/upload" passHref>
                <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First File
                </Button>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              placeholder="Search job descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <Button variant="outline" className="rounded-lg">
              Filter
            </Button>
          </div>

          {!isLoading && !error && filteredGenerations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGenerations.map((gen) => {
                const Icon = getGenerationIcon(gen.generationType);
                const colors = getGenerationColor(gen.generationType);

                return (
                  <Link
                    href={`/dashboard/${gen._id}`}
                    key={gen._id}
                    passHref
                    className="group"
                  >
                    <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm h-full flex flex-col transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
                      <CardHeader
                        className={`${colors.bg} rounded-t-xl border-b ${colors.border}`}
                      >
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                              <Icon className={`h-5 w-5 ${colors.text}`} />
                            </div>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {gen.userGivenName ||
                                `Unnamed ${gen.generationType}`}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow p-5">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <File className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span className="truncate">{gen.fileName}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            {format(
                              new Date(gen.uploadDate),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-20 w-full py-6 px-4 flex items-center justify-center max-w-6xl mx-auto mt-8 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-sm rounded-t-2xl">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Built by Tanay Sachdeva for interview assignment
        </span>
      </footer>
    </div>
  );
}
