import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling to prevent unhandled rejections from showing in the console
window.addEventListener('unhandledrejection', (event) => {
  // Prevent the default browser behavior (which shows the error in console)
  event.preventDefault();
  
  // Optional: You can log to a more controlled location
  console.log('Silently handled rejected promise:', event.reason);
});

createRoot(document.getElementById("root")!).render(<App />);
