import { Dialog, Button, Flex } from '@radix-ui/themes'

interface NotificationModalProps {
  selectedMessage: any
  setSelectedMessage: (msg: any) => void
}

export default function NotificationModal({
  selectedMessage,
  setSelectedMessage,
}: NotificationModalProps) {
  return (
    <Dialog.Root
      open={!!selectedMessage}
      onOpenChange={(open) => !open && setSelectedMessage(null)}
    >
      <Dialog.Content maxWidth="500px" className="p-6">
        <Dialog.Title className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {selectedMessage?.displayTitle}
        </Dialog.Title>
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300 mt-4 mb-6">
          {selectedMessage?.message}
        </div>
        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>
              បិទ
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
