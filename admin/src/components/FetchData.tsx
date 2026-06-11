import { Flex, Spinner, Text } from "@radix-ui/themes";

interface FetchDataProps {
    isLoading: boolean;
    error: Error | null;
    data: any;
    children?: React.ReactNode;
}

const FetchData = ({ isLoading, error, data, children }: FetchDataProps) => {

    if (isLoading) {
        return (
            <Flex justify="center" align="center" py="9">
                <Spinner size="3" />
                <Text ml="2" color="gray">កំពុងទាញយកទិន្នន័យ...</Text>
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex justify="center" p="5">
                <Text color="red">មានកំហុសក្នុងការទាញយកទិន្នន័យ: {error.message}</Text>
            </Flex>
        );
    }

    // const isEmpty = Array.isArray(data) ? data.length === 0 : !data;

    // if (isEmpty) {
    //     return (
    //         <Flex justify="center" p="9">
    //             <Text color="gray">មិនមានទិន្នន័យសម្រាប់បង្ហាញឡើយ</Text>
    //         </Flex>
    //     );
    // }

    return <>{children}</>;
};

export default FetchData;