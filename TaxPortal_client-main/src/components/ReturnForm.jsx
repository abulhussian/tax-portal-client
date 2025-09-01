"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import FileUpload from "./FileUpload"
import { X, FileText, Loader2, Trash2, MessageSquare } from "lucide-react"
import { validateFileType, validateFileSize } from "../utils/validators"

const ReturnForm = ({ isOpen, onClose, onSubmit, editingReturn }) => {
  const [formData, setFormData] = useState({
    type: "1040",
    documents: [],
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (editingReturn) {
      setFormData({
        type: editingReturn.type || "1040",
        documents: editingReturn.documents || [],
        notes: editingReturn.notes || "",
      })
    } else {
      setFormData({
        type: "1040",
        documents: [],
        notes: "",
      })
    }
  }, [editingReturn])

  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
  ]

  const handleFileUpload = (files) => {
    const validFiles = []
    const errors = []

    Array.from(files).forEach((file) => {
      if (!validateFileType(file, allowedFileTypes)) {
        errors.push(`${file.name}: Invalid file type`)
        return
      }

      if (!validateFileSize(file, 10)) {
        // 10MB limit
        errors.push(`${file.name}: File too large (max 10MB)`)
        return
      }

      const newDocument = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes("pdf")
          ? "pdf"
          : file.type.includes("word") || file.type.includes("document")
            ? "docx"
            : "image",
        size: file.size,
        uploadDate: new Date().toISOString().split("T")[0],
        comments: "",
        file: file, // Store the actual file for processing
      }

      validFiles.push(newDocument)
    })

    if (errors.length > 0) {
      setError(errors.join(", "))
    } else {
      setError("")
    }

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...validFiles],
      }))
    }
  }

  const handleDocumentComment = (documentId, comment) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => (doc.id === documentId ? { ...doc, comments: comment } : doc)),
    }))
  }

  const handleRemoveDocument = (documentId) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== documentId),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (formData.documents.length === 0) {
        setError("Please upload at least one document")
        return
      }

      // Simulate file processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      onSubmit(formData)
    } catch (error) {
      setError("Failed to save tax return. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{editingReturn ? "Edit Tax Return" : "New Tax Return"}</CardTitle>
                  <CardDescription>
                    {editingReturn ? "Update your tax return information" : "Create a new tax return filing"}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Return Type Selection */}
                <div>
                  <Label className="text-base font-medium">Return Type</Label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "1040"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFormData({ ...formData, type: "1040" })}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Form 1040</h3>
                          <p className="text-sm text-gray-500">Individual Income Tax Return</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "1065"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFormData({ ...formData, type: "1065" })}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Form 1065</h3>
                          <p className="text-sm text-gray-500">Partnership Income Tax Return</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <Label className="text-base font-medium">Documents</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload supporting documents (PDF, Word, Images). Maximum file size: 10MB
                  </p>

                  <FileUpload onFileUpload={handleFileUpload} />

                  {/* Document List */}
                  {formData.documents.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium text-gray-900">Uploaded Documents ({formData.documents.length})</h4>
                      {formData.documents.map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border border-gray-200 rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{doc.type.toUpperCase()}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Document Comments */}
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <Textarea
                                placeholder="Add comments about this document..."
                                value={doc.comments}
                                onChange={(e) => handleDocumentComment(doc.id, e.target.value)}
                                className="min-h-[60px] resize-none"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div>
                  <Label htmlFor="notes" className="text-base font-medium">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes or special instructions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingReturn ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{editingReturn ? "Update Return" : "Create Return"}</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ReturnForm
