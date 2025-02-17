'use client';
import { useState } from 'react';
import { parseCSV } from '@/utils/csvParser';
import { Participant } from '@/types/participant';
import dynamic from 'next/dynamic';

const TeamSelector = dynamic(() => import('@/components/TeamSelector'), { ssr: false });

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsLoading(true);
    try {
      const parsedParticipants = await parseCSV(e.target.files[0]);
      setParticipants(parsedParticipants);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 overflow-visible">
      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-2xl font-bold mb-4">Team Selector</h1>
          <label className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">
            Upload Participants CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="overflow-visible">
          <TeamSelector participants={participants} />
        </div>
      )}
    </main>
  );
}
