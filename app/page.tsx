"use client";
import Header from "./ui/Header";
import DashboardChart from "./ui/chartboard";
import DashStats from "./ui/dashStats";
import RecentFlaggedMatches from "./ui/recentMatches";

export default function Home() {
  return (
  <div className="flex flex-col gap-6">
    <Header/>
    <DashStats/>
    <RecentFlaggedMatches/>
  </div>
  );
}
