'use client';

import { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { Participant, Team, GameState } from "@/types/participant";

interface Props {
  participants: Participant[];
}

export default function TeamSelector({ participants }: Props) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem("teamSelectorState");
    if (saved) {
      return JSON.parse(saved);
    }
    const captains = participants.filter((p) => p.isCaptain);
    const nonCaptains = participants.filter((p) => !p.isCaptain);
    return {
      teams: captains.map((captain) => ({ captain, members: [] })),
      availableParticipants: nonCaptains,
      currentCaptainIndex: 0,
    };
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<number>(0);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    localStorage.setItem("teamSelectorState", JSON.stringify(gameState));
  }, [gameState]);

  const getTeamSkillCounts = (team: Team) => {
    const counts = {
      frontend: 0,
      backend: 0,
      mobile: 0,
      fullstack: 0
    };
    team.members.forEach(member => {
      counts[member.skillType]++;
    });
    return counts;
  };

  const getCurrentTeamBalance = () => {
    const currentTeam = gameState.teams[gameState.currentCaptainIndex];
    return getTeamSkillCounts(currentTeam);
  };

  const findBestCandidates = () => {
    const currentBalance = getCurrentTeamBalance();
    const needsFrontend = currentBalance.frontend < currentBalance.backend;
    const needsBackend = currentBalance.backend < currentBalance.frontend;
    
    return gameState.availableParticipants.filter(p => {
      if (needsFrontend && p.skillType === 'frontend') return true;
      if (needsBackend && p.skillType === 'backend') return true;
      if (!needsFrontend && !needsBackend) return true;
      return p.skillType === 'fullstack';
    });
  };

  const handleSpin = () => {
    if (isSpinning || gameState.availableParticipants.length === 0) return;
    
    const bestCandidates = findBestCandidates();
    const candidatePool = bestCandidates.length > 0 ? bestCandidates : gameState.availableParticipants;
    
    const selectedCandidate = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    const originalIndex = gameState.availableParticipants.findIndex(p => p.name === selectedCandidate.name);
    
    setSelectedParticipant(originalIndex);
    setIsSpinning(true);
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
    setShowNext(true);
  };

  const handleNext = () => {
    const selected = gameState.availableParticipants[selectedParticipant];
    setGameState((prev) => {
      const newState = {
        ...prev,
        teams: prev.teams.map((team, idx) =>
          idx === prev.currentCaptainIndex
            ? { ...team, members: [...team.members, selected] }
            : team
        ),
        availableParticipants: prev.availableParticipants.filter(
          (p) => p.name !== selected.name
        ),
        currentCaptainIndex: (prev.currentCaptainIndex + 1) % prev.teams.length,
      };
      return newState;
    });
    setShowNext(false);
  };

  const handleReset = () => {
    const captains = participants.filter((p) => p.isCaptain);
    const nonCaptains = participants.filter((p) => !p.isCaptain);
    setGameState({
      teams: captains.map((captain) => ({ captain, members: [] })),
      availableParticipants: nonCaptains,
      currentCaptainIndex: 0,
    });
    setShowNext(false);
  };

  const currentCaptain =
    gameState.teams[gameState.currentCaptainIndex]?.captain;

  return (
    <div className="container mx-auto p-4 max-w-[1600px]">
      <h1 className="text-3xl font-bold mb-8 text-center">Team Selection</h1>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left Section - Wheel */}
        <div className="lg:w-3/5 overflow-visible">
          <div className="sticky top-4 overflow-visible">
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4 text-center">
                Current Captain: {currentCaptain?.name || "Selection Complete"}
              </h2>

              {gameState.availableParticipants.length > 0 ? (
                <div className="flex flex-col items-center space-y-8">
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "700px",
                      aspectRatio: "1 / 1",
                      position: "relative",
                      margin: "20px auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: showNext ? "2px solid #22c55e" : "2px solid #60a5fa",
                      borderRadius: "50%",
                      padding: "8px",
                    }}
                  >
                    <style jsx global>{`
                      .sc-gsTCUz.bhdLno {
                        visibility: visible !important;
                      }
                    `}</style>
                    <Wheel
                      mustStartSpinning={isSpinning}
                      prizeNumber={selectedParticipant}
                      data={gameState.availableParticipants.map((p, index) => ({
                        option:
                          p.name.length > 15
                            ? p.name.substring(0, 15) + "..."
                            : p.name,
                        style: {
                          backgroundColor: [
                            "#FFD6D6",
                            "#D6E4FF",
                            "#FFE4CC",
                            "#D6FFD6",
                            "#E6D6FF",
                          ][index % 5],
                          textColor: "#000000",
                          fontSize: 14,
                          fontFamily: "system-ui",
                          fontWeight: "600",
                        },
                      }))}
                      onStopSpinning={handleSpinComplete}
                      radiusLineWidth={2}
                      fontSize={14}
                      outerBorderWidth={3}
                      spinDuration={0.8}
                      textDistance={70}
                      innerRadius={30}
                      innerBorderColor="#fff"
                      innerBorderWidth={3}
                      outerBorderColor="#CBD5E0"
                      radiusLineColor="#E2E8F0"
                    />
                  </div>
                  {showNext ? (
                    <div className="flex flex-col items-center space-y-4 w-full max-w-[350px]">
                      <div className="w-full bg-green-100 p-6 rounded-lg text-center border-2 border-green-500 animate-fadeIn">
                        <p className="text-sm text-green-600 mb-1">Selection Complete!</p>
                        <div className="font-bold text-xl text-gray-800">
                          {gameState.availableParticipants[selectedParticipant].name}
                        </div>
                      </div>
                      <button
                        className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors w-full shadow-lg animate-bounce"
                        onClick={handleNext}
                      >
                        Add to {currentCaptain.name}&apos;s Team
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mt-2 bg-blue-400 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-500 transition-colors w-full max-w-[250px] shadow-lg"
                      onClick={handleSpin}
                      disabled={isSpinning}
                    >
                      {isSpinning ? "Spinning..." : "Spin!"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-600">
                  All participants have been selected!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Teams */}
        <div className="lg:w-2/5">
          <div className="grid grid-cols-1 gap-4">
            {gameState.teams.map((team) => {
              const skillCounts = getTeamSkillCounts(team);
              return (
                <div
                  key={team.captain.name}
                  className="bg-white p-4 rounded-lg shadow-lg border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">
                    {team.captain.name}&apos;s Team
                  </h3>
                  <div className="mb-3 flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 rounded-full">
                      FE: {skillCounts.frontend}
                    </span>
                    <span className="px-2 py-1 bg-green-100 rounded-full">
                      BE: {skillCounts.backend}
                    </span>
                    {skillCounts.mobile > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 rounded-full">
                        Mobile: {skillCounts.mobile}
                      </span>
                    )}
                    {skillCounts.fullstack > 0 && (
                      <span className="px-2 py-1 bg-purple-100 rounded-full">
                        FS: {skillCounts.fullstack}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {team.members.map((member) => (
                      <li
                        key={member.name}
                        className={`text-sm p-2 rounded text-gray-700 ${
                          member.skillType === 'frontend'
                            ? 'bg-blue-50'
                            : member.skillType === 'backend'
                            ? 'bg-green-50'
                            : member.skillType === 'mobile'
                            ? 'bg-yellow-50'
                            : 'bg-purple-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{member.name}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-opacity-50 ${
                            member.skillType === 'frontend'
                              ? 'bg-blue-200'
                              : member.skillType === 'backend'
                              ? 'bg-green-200'
                              : member.skillType === 'mobile'
                              ? 'bg-yellow-200'
                              : 'bg-purple-200'
                          }`}>
                            {member.skillType === 'frontend' 
                              ? 'FE' 
                              : member.skillType === 'backend' 
                              ? 'BE' 
                              : member.skillType === 'mobile'
                              ? 'Mobile'
                              : 'FS'}
                          </span>
                        </div>
                      </li>
                    ))}
                    {team.members.length === 0 && (
                      <li className="text-sm text-gray-400 italic">
                        No members selected yet
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          className="bg-red-400 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition-colors shadow-md"
          onClick={handleReset}
        >
          Reset Teams
        </button>
      </div>
    </div>
  );
}
