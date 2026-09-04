// Base Shimmer Box Component
export function SkeletonBox({ className = "", style = {} }) {
  return (
    <div
      className={`shimmer-card ${className}`}
      style={style}
    />
  );
}

// Homepage Skeleton Loader
export function HomeSkeleton() {
  return (
    <div className="pt-[80px] pb-[60px] max-w-[1440px] mx-auto px-[24px] flex flex-col gap-[36px] w-full">
      {/* Hero Section Skeleton */}
      <div className="flex flex-col items-center gap-[24px] text-center w-full max-w-[1000px] mx-auto">
        {/* Profile Avatar Circle */}
        <SkeletonBox className="w-[140px] h-[140px] rounded-full shadow-md" />
        
        {/* Name & Role Lines */}
        <div className="flex flex-col items-center gap-[10px] w-full max-w-[360px]">
          <SkeletonBox className="w-[70%] h-[32px] rounded-[12px]" />
          <SkeletonBox className="w-[45%] h-[20px] rounded-[10px]" />
        </div>

        {/* Intro Box */}
        <SkeletonBox className="w-full max-w-[720px] h-[90px] rounded-[20px]" />

        {/* 3 About Me Cards (Education, GPAX, Languages) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] w-full mt-[8px]">
          <SkeletonBox className="h-[76px] rounded-[18px]" />
          <SkeletonBox className="h-[76px] rounded-[18px]" />
          <SkeletonBox className="h-[76px] rounded-[18px]" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-[16px] justify-center mt-[4px]">
          <SkeletonBox className="w-[140px] h-[48px] rounded-[50px]" />
          <SkeletonBox className="w-[140px] h-[48px] rounded-[50px]" />
        </div>

        {/* Stat Bar Pill */}
        <SkeletonBox className="w-[320px] h-[36px] rounded-[50px] mt-[8px]" />
      </div>

      {/* Content Section Skeleton (Achievements / Activities) */}
      <div className="bg-white/70 backdrop-blur-[16px] rounded-[24px] p-[32px] flex flex-col gap-[20px] max-w-[1000px] mx-auto w-full">
        <SkeletonBox className="w-[200px] h-[28px] rounded-[10px]" />
        <SkeletonBox className="w-full h-[80px] rounded-[16px]" />
        <SkeletonBox className="w-full h-[80px] rounded-[16px]" />
      </div>
    </div>
  );
}

// Projects Page Skeleton Loader
export function ProjectsSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-[24px] pt-[88px] pb-[60px] flex flex-col gap-[28px]">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-[12px] items-center">
        <SkeletonBox className="w-[260px] h-[42px] rounded-[50px]" />
        <SkeletonBox className="w-[90px] h-[42px] rounded-[50px]" />
        <SkeletonBox className="w-[90px] h-[42px] rounded-[50px]" />
        <SkeletonBox className="w-[90px] h-[42px] rounded-[50px]" />
      </div>

      {/* Select Projects Card Grid */}
      <div className="bg-white/75 backdrop-blur-[16px] rounded-[24px] p-[24px] flex flex-col gap-[16px] shadow-sm">
        <SkeletonBox className="w-[160px] h-[24px] rounded-[8px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[16px]">
          <SkeletonBox className="h-[84px] rounded-[18px]" />
          <SkeletonBox className="h-[84px] rounded-[18px]" />
          <SkeletonBox className="h-[84px] rounded-[18px]" />
          <SkeletonBox className="h-[84px] rounded-[18px]" />
          <SkeletonBox className="h-[84px] rounded-[18px]" />
          <SkeletonBox className="h-[84px] rounded-[18px]" />
        </div>
      </div>

      {/* Detailed Project Card */}
      <div className="bg-white/75 backdrop-blur-[16px] rounded-[24px] p-[32px] flex flex-col gap-[20px] shadow-sm">
        <SkeletonBox className="w-full h-[340px] rounded-[20px]" />
        <SkeletonBox className="w-[35%] h-[32px] rounded-[10px]" />
        <SkeletonBox className="w-[85%] h-[64px] rounded-[12px]" />
      </div>
    </div>
  );
}

// Experiences Page Skeleton Loader
export function ExperiencesSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto px-[24px] pt-[88px] pb-[60px] flex flex-col gap-[28px]">
      <SkeletonBox className="w-[240px] h-[36px] rounded-[12px] mx-auto" />
      <div className="flex flex-col gap-[20px]">
        <SkeletonBox className="w-full h-[140px] rounded-[20px]" />
        <SkeletonBox className="w-full h-[140px] rounded-[20px]" />
        <SkeletonBox className="w-full h-[140px] rounded-[20px]" />
      </div>
    </div>
  );
}
