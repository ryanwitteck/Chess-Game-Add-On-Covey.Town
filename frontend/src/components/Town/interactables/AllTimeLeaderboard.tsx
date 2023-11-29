import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { getTopUsersByWins, UserData } from '../../Login/FirebaseService';
import { useState, useEffect } from 'react';

interface LeaderboardProps {
  topN: number;
}

/**
 * A component that renders an all time leaderboard by fetching data from a database, formatted as a table with the following columns:
 * - Player: the username of the player
 * - Wins: the number of games the player has won
 * - Losses: the number of games the player has lost
 * - Ties: the number of games the player has tied
 * Each column has a header (a table header `th` element) with the name of the column.
 *
 *
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 *
 * @returns
 */
export default function AllTimeLeaderboard({ topN }: LeaderboardProps): JSX.Element {
  const [leaderboardData, setLeaderboardData] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const topUsers = await getTopUsersByWins(topN);
        setLeaderboardData(topUsers);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, [topN]);

  return (
    <Table width={100} style={{ overflowX: 'auto' }}>
      <Thead>
        <Tr>
          <th>Player</th>
          <th>Wins</th>
          <th>Losses</th>
          <th>Ties</th>
        </Tr>
      </Thead>
      <Tbody>
        {leaderboardData.map(user => (
          <Tr key={user.username}>
            <Td>{user.username}</Td>
            <Td>{user.wins}</Td>
            <Td>{user.losses}</Td>
            <Td>{user.ties}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
