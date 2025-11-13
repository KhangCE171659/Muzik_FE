interface PlayListDetailProps {
  id: string;
}

export const PlayListDetail = ({ id }: PlayListDetailProps) => {
  console.log(id, "id in PlayListDetail");
  return <div>PlayListDetail {id}</div>;
};
