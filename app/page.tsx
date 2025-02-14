"use client"
import { ModeToggle } from '@/components/modetoggle'
import ReportComponent from '@/components/reportComponent'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import {   useToast } from '@/hooks/use-toast'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { Settings } from 'lucide-react'
import React, { useState } from 'react'
import ChatComponent from '@/components/ChatComponent'


// type Props = {}

const Home = () => {
  const [reportData, setreportData] = useState("")
  const {toast} = useToast();
  const onReportConfirmation = (data:string)=>{
    setreportData(data);
    toast({
      description:"Update successfully"
    })
  }
  return (
    <div className='grid h-screen w-full'>
      <div className='flex flex-col'>
        <header className='sticky top-0 z-10 h-[57px] bg-background flex items-center gap-1 border-b px-4'>
          <h1 className='text-xl font-semibold text-[#D90013]'>HealIntel</h1>
          <div className='w-full flex flex-row justify-end gap-2'>
          <ModeToggle/>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant={'outline'} size={'icon'} className='md:hidden'>
                <Settings />
              </Button>
            </DrawerTrigger>
            <DrawerContent className='h-[84vh] ' >
              <DialogTitle className="sr-only">Report Drawer</DialogTitle>
              <DialogDescription className="sr-only">This drawer contains a report component with various details.</DialogDescription>
              <ReportComponent onReportConfirmation = {onReportConfirmation}/>
            </DrawerContent>
          </Drawer>
          </div>
        </header>
        <main className='grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3'>
            <div className='hidden md:flex flex-col'>
            <ReportComponent onReportConfirmation = {onReportConfirmation}/>
            </div>
            <div className='lg:col-span-2'>
              <ChatComponent reportData={reportData}/>
            </div>
        </main>
      </div>
    </div>
  )
}
export default Home