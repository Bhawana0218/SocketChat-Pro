import { useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { LoginPage } from "@/pages/LoginPage";
import { ChatPage } from "@/pages/ChatPage";
import { CallModal } from "@/components/CallModal";

function App() {
  const isLoggedIn = useChatStore((s) => s.isLoggedIn);
  const setCurrentUser = useChatStore((s) => s.setCurrentUser);

  const handleLogin = useCallback(
    (username: string) => {
      setCurrentUser(username);
    },
    [setCurrentUser]
  );

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <ChatPage />
      <CallModal />
    </>
  );
}

export default App;
