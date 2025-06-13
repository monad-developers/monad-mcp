export function Background({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Middle layer - decorative background */}
      <div className="fixed inset-0 pointer-events-none animate-onboarding-fade duration-500 overflow-hidden">
        {/* Custom Modal Lightings */}
        <div
          className="absolute inset-0 flex items-center justify-center animate-onboarding-slide"
          style={{ top: '-760px' }}
        >
          <div
            className="middle-lighting w-[1136.263px] h-[176px] rounded-full"
            style={{
              background: '#9489FC',
              opacity: 0.33,
              filter: 'blur(100px)',
              transform: 'rotate(-38.43deg)',
            }}
          />
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center animate-onboarding-slide"
          style={{ right: '-75vw', bottom: '-860px' }}
        >
          <div
            className="middle-lighting w-[1136.263px] h-[176px] rounded-full"
            style={{
              background: '#9489FC',
              opacity: 0.33,
              filter: 'blur(120px)',
              transform: 'rotate(-38.43deg)',
            }}
          />
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}
