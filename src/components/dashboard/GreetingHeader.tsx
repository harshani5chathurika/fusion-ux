"use client";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function GreetingHeader({ name }: { name: string }) {
  return (
    <h1 className="text-2xl font-bold tracking-tight">
      {getGreeting()}, {name} 👋
    </h1>
  );
}
