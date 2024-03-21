import PageContainer from '@/components/common/PageContainer';
import PageTitle from '@/components/common/PageTitle';
import PoweredByAlgebra from '@/components/common/PoweredByAlgebra';
import CreatePoolForm from '@/components/create-pool/CreatePoolForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CreatePoolPage = () => {
    return (
        <PageContainer>
            <div className="w-full flex justify-between">
                <PageTitle title={'Create Pool'} showSettings={false} />
                <Link to={'/pools'}>
                    <Button className="whitespace-nowrap" size={'md'}>
                        Go back
                    </Button>
                </Link>
            </div>
            <div className="mr-auto">
                <div className="w-[500px] max-lg:w-full p-4 bg-card border-border border rounded-3xl mt-16 ">
                    <CreatePoolForm />
                </div>
                <PoweredByAlgebra className="mt-2" />
            </div>
        </PageContainer>
    );
};

export default CreatePoolPage;
