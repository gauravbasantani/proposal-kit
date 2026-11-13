import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/styles/index.css";
import { ProposalSummary } from "@/views/ProposalSummary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProposalSummary />
  </StrictMode>,
);
