import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import TaskDetails from './pages/TaskDetails'
import TeamMembers from './pages/TeamMembers'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id" element={<TaskDetails />} />
        <Route path="team" element={<TeamMembers />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
