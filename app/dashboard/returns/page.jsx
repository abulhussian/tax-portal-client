"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../src/contexts/AuthContext"
// import { usePermissions } from "../../../src/contexts/PermissionsContext"
import ReturnForm from "@/src/components/ReturnForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, Clock, CheckCircle, Eye, Edit, Users, Search } from "lucide-react"
import { getStoredData, setStoredData, seedReturns, addActivityLog } from "@/src/data/seed"


const Returns = () => {
  const { user } = useAuth()
  // const {   } = usePermissions()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [returns, setReturns] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingReturn, setEditingReturn] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingStatus, setEditingStatus] = useState({})

  useEffect(() => {
    // Load returns from localStorage or use seed data
    const storedReturns = getStoredData("returns", seedReturns)
    setReturns(storedReturns)
  }, [])

  const handleAddReturn = (newReturn) => {
    const returnWithId = {
      ...newReturn,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Pending",
      documentCount: newReturn.documents?.length || 0,
    }

    const updatedReturns = [returnWithId, ...returns]
    setReturns(updatedReturns)
    setStoredData("returns", updatedReturns)

    // Add activity log
    addActivityLog("Tax Return Created", "Tax Return", `New ${newReturn.type} return created`)

    setShowForm(false)
  }

  const handleUpdateReturn = (updatedReturn) => {
    const updatedReturns = returns.map((r) =>
      r.id === updatedReturn.id
        ? {
            ...updatedReturn,
            lastUpdated: new Date().toISOString().split("T")[0],
            documentCount: updatedReturn.documents?.length || 0,
          }
        : r,
    )
    setReturns(updatedReturns)
    setStoredData("returns", updatedReturns)

    // Add activity log
    addActivityLog("Tax Return Updated", "Tax Return", `Return #${updatedReturn.id} was modified`)

    setEditingReturn(null)
    setShowForm(false)
  }

  const handleStatusChange = (returnId, newStatus, returnName) => {
    setEditingStatus({ ...editingStatus, [returnId]: true })
    
    const updatedReturns = returns.map((r) =>
      r.id === returnId
        ? {
            ...r,
            status: newStatus,
            lastUpdated: new Date().toISOString().split("T")[0],
          }
        : r,
    )
    setReturns(updatedReturns)
    setStoredData("returns", updatedReturns)

    // Add activity log
    addActivityLog("Status Updated", "Tax Return", `Return ${returnName} status changed to ${newStatus}`)
    
    setTimeout(() => {
      setEditingStatus({ ...editingStatus, [returnId]: false })
    }, 500)
  }

  const handleDeleteReturn = (returnId) => {
    const updatedReturns = returns.filter((r) => r.id !== returnId)
    setReturns(updatedReturns)
    setStoredData("returns", updatedReturns)

    // Add activity log
    addActivityLog("Tax Return Deleted", "Tax Return", `Return #${returnId} was deleted`)
  }

  const stats = {
    total: returns.length,
    pending: returns.filter((r) => r.status === "Pending").length,
    inReview: returns.filter((r) => r.status === "In Review").length,
    completed: returns.filter((r) => r.status === "Completed").length,
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Review': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Filter returns based on search term
  const filteredReturns = returns.filter(returnItem =>
    returnItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tax Returns</h1>
                <p className="text-gray-600">Manage your tax return filings and track their progress.</p>
              </div>
              <Button
                onClick={() => {
                  setEditingReturn(null)
                  setShowForm(true)
                }}
                className="w-fit"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Tax Return
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Review</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.inReview}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Returns Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReturns.map((returnItem) => (
                      <tr key={returnItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{returnItem.name || `Return #${returnItem.id}`}</div>
                            <div className="text-sm text-gray-500">{returnItem.taxYear || '2023'}</div>
                            <div className="text-xs text-gray-400 mt-1">Created: {returnItem.createdDate}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{returnItem.documentCount || 0} files</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{returnItem.type || 'Individual'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
  <span
    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(returnItem.status)}`}
  >
    {returnItem.status}
  </span>
</td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                       

<Link
  href={`/dashboard/coustmerdetails`}
  className="text-blue-600 hover:text-blue-700 transition-colors"
  title="View Details"
>
  <Eye className="w-4 h-4" />
</Link>

                      {('action:return.edit') && (
                        <button
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                          title="Edit Return"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredReturns.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new return.'}
                  </p>
                </div>
              )}
            </div>

            {/* Tabs for filtered views */}
            {/* <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">All Returns</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="in-review">In Review ({stats.inReview})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              </TabsList>
            </Tabs> */}
          </motion.div>
        </main>
      </div>

      {/* Return Form Modal */}
      {showForm && (
        <ReturnForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingReturn(null)
          }}
          onSubmit={editingReturn ? handleUpdateReturn : handleAddReturn}
          editingReturn={editingReturn}
        />
      )}
    </div>
  )
}

export default Returns