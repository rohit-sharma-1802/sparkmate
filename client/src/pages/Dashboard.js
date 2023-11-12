import DashboardComponent from "../components/Dashboard/Dashboard";
import ErrorBoundary from "../components/ErrorBoundary";

const Dashboard = () => {
  return (
    <div className="user-dashboard">
      <ErrorBoundary fallback="There has been a error. We are trying to fix it">
        <DashboardComponent />
      </ErrorBoundary>
    </div>
  );
};
export default Dashboard;
