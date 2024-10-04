"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Globe, CheckCircle, XCircle, Settings, LogOut, User, Search, Clock, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Website = {
  id: string
  url: string
  isUp: boolean
  trackingSince: Date
  uptimePercentage: number
  responseTime: number
  lastDowntime?: { date: Date; duration: number }
}

const initialWebsites: Website[] = [
  {
    id: "1",
    url: "https://example.com",
    isUp: true,
    trackingSince: new Date(2023, 0, 1),
    uptimePercentage: 99.9,
    responseTime: 250,
    lastDowntime: { date: new Date(2023, 5, 18), duration: 15 },
  },
  {
    id: "2",
    url: "https://downsite.com",
    isUp: false,
    trackingSince: new Date(2023, 5, 15),
    uptimePercentage: 95.5,
    responseTime: 500,
    lastDowntime: { date: new Date(2023, 5, 22), duration: 60 },
  },
]

export function DashboardComponent() {
  const [url, setUrl] = useState("")
  const [websites, setWebsites] = useState<Website[]>(initialWebsites)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)
  const [nextCheck, setNextCheck] = useState(new Date(Date.now() + 300000)) // 5 minutes from now
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [websiteToDelete, setWebsiteToDelete] = useState<string | null>(null)

  const addWebsite = () => {
    if (url) {
      const newWebsite: Website = {
        id: (websites.length + 1).toString(),
        url,
        isUp: true,
        trackingSince: new Date(),
        uptimePercentage: 100,
        responseTime: 0,
      }
      setWebsites([...websites, newWebsite])
      setUrl("")
    }
  }

  const openDeleteConfirm = (id: string) => {
    setWebsiteToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const deleteWebsite = () => {
    if (websiteToDelete) {
      setWebsites(websites.filter(website => website.id !== websiteToDelete))
      if (selectedWebsite && selectedWebsite.id === websiteToDelete) {
        setSelectedWebsite(null)
      }
      setDeleteConfirmOpen(false)
      setWebsiteToDelete(null)
    }
  }

  const getDaysSince = (date: Date) => {
    const diffTime = Math.abs(new Date().getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredWebsites = websites.filter(website =>
    website.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const downtimeData = websites.map(website => ({
    name: website.url,
    downtime: website.lastDowntime ? website.lastDowntime.duration : 0,
  }))

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-purple-900 p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold">Website Uptime Dashboard</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-10 h-10 rounded-full bg-purple-800 hover:bg-purple-700">
              <User className="h-5 w-5" />
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-800 text-gray-100 border-gray-700">
            <DropdownMenuItem className="cursor-pointer hover:bg-purple-700 focus:bg-purple-700">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-purple-700 focus:bg-purple-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-grow flex flex-col overflow-hidden p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Add a new site monitor</h2>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow bg-gray-700 border-purple-700 text-white placeholder-gray-400"
              />
              <Button onClick={addWebsite} className="bg-purple-700 hover:bg-purple-600">
                Add URL
              </Button>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center min-w-[300px]">
            <Clock className="mr-4 text-purple-400" size={32} />
            <div>
              <h2 className="text-lg font-semibold mb-1">Next Scheduled Check</h2>
              <p className="text-2xl font-bold">{nextCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            </div>
          </div>
        </div>
        <div className="flex-grow flex gap-4 overflow-hidden">
          <div className="w-1/2 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My URLs</h2>
              <span className="text-sm text-gray-400">Total: {websites.length}</span>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search URLs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-4 overflow-y-auto flex-grow">
              {filteredWebsites.map((website) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-sm hover:bg-gray-600 transition-colors"
                >
                  <div 
                    className="flex items-center space-x-4 flex-grow cursor-pointer"
                    onClick={() => setSelectedWebsite(website)}
                  >
                    <Globe className="text-purple-400" size={24} />
                    <div>
                      <p className="font-medium">{website.url}</p>
                      <p className="text-sm text-gray-400">
                        Tracking since {getDaysSince(website.trackingSince)} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {website.isUp ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <XCircle className="text-red-500" size={24} />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteConfirm(website.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-gray-700"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-1/2 bg-gray-800 p-6 rounded-lg shadow-md overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Website Stats</h2>
            {selectedWebsite ? (
              <div>
                <h3 className="text-lg font-medium mb-4">{selectedWebsite.url}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Status</p>
                    <p className={selectedWebsite.isUp ? "text-green-500" : "text-red-500"}>
                      {selectedWebsite.isUp ? 'Up' : 'Down'}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Uptime</p>
                    <p>{selectedWebsite.uptimePercentage.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="font-semibold">Response Time</p>
                    <p>{selectedWebsite.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="font-semibold">Last Downtime</p>
                    {selectedWebsite.lastDowntime ? (
                      <p>{selectedWebsite.lastDowntime.date.toLocaleDateString()} ({selectedWebsite.lastDowntime.duration} min)</p>
                    ) : (
                      <p>No recent downtime</p>
                    )}
                  </div>
                </div>
                <h4 className="text-md font-medium mt-6 mb-2">Downtime Graph</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={downtimeData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="downtime" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Select a website to view detailed stats</p>
            )}
          </div>
        </div>
      </main>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-gray-800/80 backdrop-blur-md text-gray-100 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              This action cannot be undone. This will permanently delete the website from your monitoring list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-gray-100 hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteWebsite} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}