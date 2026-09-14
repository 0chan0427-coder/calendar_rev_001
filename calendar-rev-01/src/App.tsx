import CalendarPage from './pages/CalendarPage';
import WorldPage from './pages/WorldPage';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  return params.get('world') === '1' ? <WorldPage /> : <CalendarPage />;
}
