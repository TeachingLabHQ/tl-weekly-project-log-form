export const LandingPage = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <div className="w-fit p-10 rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white flex flex-col items-center gap-3 ">
      {errorMessage
        ? errorMessage
        : "Please log in with your Teaching Lab email"}
    </div>
  );
};
