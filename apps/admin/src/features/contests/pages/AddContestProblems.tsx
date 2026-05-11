import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import CreateContestProblem from "../components/CreateContestProblem";
import { ModeSelector } from "../components/ModeSelector";
import { ExistingProblemPicker } from "../components/ExistingProblemPicker";

type Mode = "select" | "existing" | "create";

const AddContestProblems: React.FC = () => {
  const navigate = useNavigate();
  const { id: contestId } = useParams({
    from: "/_authenticated/contests/$id/manage-problems",
  });
  const [mode, setMode] = useState<Mode>("select");

  const handleBack = () => {
    if (mode === "select") navigate({ to: `/contests/${contestId}` });
    else setMode("select");
  };

  if (mode === "select") return <ModeSelector onSelect={setMode} onBack={handleBack} />;
  if (mode === "existing") return <ExistingProblemPicker contestId={contestId} onBack={handleBack} />;
  return <CreateContestProblem contestId={contestId} onBack={handleBack} onSuccess={() => setMode("select")} />;
};

export default AddContestProblems;
