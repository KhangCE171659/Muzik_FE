import { PlayListDetail } from "@/modules/playList/components/PlayListDetail";
import React from "react";

// import { ExerciseDetail } from "@/modules/exerciseDetail/components/ExerciseDetail";

async function PlayListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PlayListDetail id={id} />
    </div>
  );
}

export default PlayListDetailPage;
