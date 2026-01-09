import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { gsap } from "gsap";

// Configure GSAP to suppress null target warnings
// These warnings occur during React component mount/unmount cycles and page transitions
// but don't indicate actual errors since we use proper ref checks and context cleanup
gsap.config({ nullTargetWarn: false });

// Import profile test for development
import './test/profile-test';

createRoot(document.getElementById("root")!).render(<App />);
