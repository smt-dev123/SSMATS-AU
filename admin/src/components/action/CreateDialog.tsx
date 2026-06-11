import { AlertDialog, Button, Flex } from '@radix-ui/themes'

interface Props {
  title: string
  onConfirm: (data: { name: string }) => void
  onCancel?: () => void
  isLoading?: boolean
}

const CreateDialog = ({ title, onConfirm, onCancel, isLoading }: Props) => {
  return (
    <AlertDialog.Content maxWidth="450px">
      <AlertDialog.Title>{title}</AlertDialog.Title>

      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray" onClick={onCancel}>
            ចាកចេញ
          </Button>
        </AlertDialog.Cancel>

        <AlertDialog.Action>
          <Button
            variant="solid"
            color="green"
            // onClick={handleSubmit}
            disabled={isLoading}
          >
            បង្កើត
          </Button>
        </AlertDialog.Action>
      </Flex>
    </AlertDialog.Content>
  )
}

export default CreateDialog
