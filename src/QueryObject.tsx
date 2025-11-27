import { useSuiClientQuery } from "@onelabs/dapp-kit";
import type { SuiObjectData } from "@onelabs/sui/client";

export function Counter({ id }: { id: string }) {
   
   const { data, isPending, error } = useSuiClientQuery('getObject', {
    id: id,
    options: {
      showContent: true, 
    },
  });

  
  if (isPending) return <div>Loading object information...</div>;

  
  if (error) return <div>An error occurred: {error.message}</div>;

 
  if (!data || !data.data) return <div>No object data found.</div>;

  
  const renderObjectData = (objectData: SuiObjectData | { [s: string]: unknown; } | ArrayLike<unknown>) => {
    return Object.entries(objectData).map(([key, value], index) => (
      <li key={index}>{`${key}: ${JSON.stringify(value)}`}</li>
    ));
  };

  
  return (
    <div>
      <h3>Object Details:</h3>
      <ul>
        {renderObjectData(data.data)}
      </ul>
    </div>
  );
}