import { useEffect, useState } from "react";
import { ConnectionInvitations } from "./components/ConnectionInvitations";
import { FirstDegreeConnections } from "./components/FirstDegreeConnections";
import { MutualConnectionsDialog } from "./components/MutualConnectionsDialog";
import { PeopleYouMayKnow } from "./components/PeopleYouMayKnow";
import {
  acceptConnectionInvitation,
  loadConnectionSuggestions,
  loadMutualConnections,
  loadProfessionalNetwork,
  sendConnectionRequest,
  type MutualConnection,
  type ProfessionalConnection,
  type ProfessionalNetworkSnapshot,
  type SuggestedConnection,
} from "./api/requests";
import "./styles.css";

function failureText(error: unknown) {
  return error instanceof Error ? error.message : "The network request could not be completed.";
}

const emptyNetwork: ProfessionalNetworkSnapshot = { connections: [], pending_requests: [] };

export function ProfessionalNetworkPage() {
  const [network, setNetwork] = useState(emptyNetwork);
  const [suggestions, setSuggestions] = useState<SuggestedConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [acceptingConnectionId, setAcceptingConnectionId] = useState<string | null>(null);
  const [connectingMemberId, setConnectingMemberId] = useState<string | null>(null);
  const [mutualTarget, setMutualTarget] = useState<ProfessionalConnection | null>(null);
  const [mutualConnections, setMutualConnections] = useState<MutualConnection[]>([]);
  const [loadingMutual, setLoadingMutual] = useState(false);
  const [mutualFailure, setMutualFailure] = useState<string | null>(null);

  const refreshNetwork = async () => {
    setLoading(true);
    try {
      const [nextNetwork, nextSuggestions] = await Promise.all([
        loadProfessionalNetwork(),
        loadConnectionSuggestions(),
      ]);
      setNetwork(nextNetwork);
      setSuggestions(nextSuggestions);
      setFailure(null);
    } catch (error) {
      setFailure(failureText(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refreshNetwork(); }, []);

  const acceptInvitation = async (invitation: ProfessionalConnection) => {
    setAcceptingConnectionId(invitation.id);
    setNotice(null);
    try {
      const result = await acceptConnectionInvitation(invitation.id);
      setNotice(result.new_hu_coins === undefined ? result.message : `${result.message} Your balance is now ${result.new_hu_coins} HU Coins.`);
      await refreshNetwork();
    } catch (error) {
      setFailure(failureText(error));
    } finally {
      setAcceptingConnectionId(null);
    }
  };

  const connectToMember = async (member: SuggestedConnection) => {
    setConnectingMemberId(member.id);
    setNotice(null);
    try {
      const result = await sendConnectionRequest(member.id);
      setNotice(result.message);
      await refreshNetwork();
    } catch (error) {
      setFailure(failureText(error));
    } finally {
      setConnectingMemberId(null);
    }
  };

  const showMutualConnections = async (connection: ProfessionalConnection) => {
    setMutualTarget(connection);
    setLoadingMutual(true);
    setMutualFailure(null);
    setMutualConnections([]);
    try {
      const result = await loadMutualConnections(connection.user_id);
      setMutualConnections(result.mutualConnections);
    } catch (error) {
      setMutualFailure(failureText(error));
    } finally {
      setLoadingMutual(false);
    }
  };

  return (
    <section className="pn-page">
      <header className="pn-page-heading"><div><span>Professional relationships</span><h1>My network</h1><p>Manage persisted connection invitations and first-degree healthcare connections.</p></div><strong>{network.connections.length} connections</strong></header>
      {notice ? <div className="pn-notice">{notice}</div> : null}
      {failure ? <div className="pn-error" role="alert"><p>{failure}</p><button type="button" onClick={() => void refreshNetwork()}>Try again</button></div> : loading ? <p className="pn-status">Loading your professional network...</p> : (
        <>
          <ConnectionInvitations acceptingConnectionId={acceptingConnectionId} invitations={network.pending_requests} onAccept={(invitation) => void acceptInvitation(invitation)} />
          <FirstDegreeConnections connections={network.connections} onViewMutualConnections={(connection) => void showMutualConnections(connection)} />
          <PeopleYouMayKnow connectingMemberId={connectingMemberId} suggestions={suggestions} onConnect={(member) => void connectToMember(member)} />
        </>
      )}
      <MutualConnectionsDialog connection={mutualTarget} failure={mutualFailure} loading={loadingMutual} mutualConnections={mutualConnections} onClose={() => setMutualTarget(null)} />
    </section>
  );
}
