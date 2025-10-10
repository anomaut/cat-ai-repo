import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Divider from '@mui/material/Divider';

function Header({stepnumber}){

    let steps = [
    'Set Up',
    'Customize',
    'Export',
    ];

    const stepsmap = {
    0: 'Generate',
    1: 'Customize',
    2: 'Export',
    3: 'Export'
    };

    const stepscaptionmap = {
    0: 'Load your exercise file or fill manually using the manual editor',
    1: 'Custom easily your generated exercise using toolbars',
    2: 'Save your favorite exercise format as pdf',
    3: 'Save other formats or generate again'
    };

    return(
        <div className="w-full h-fit justify-items-center">
            <div className='flex justify-center w-2/3 mt-3'>
            <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />}>
                    <Link underline="hover" color="inherit" href="/" variant='subtitle2'>
                        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit"/>
                        Home
                    </Link>

                    {
                        ...steps.filter((e,i)=>i<stepnumber && i!=2).map((e,i)=>
                            <Link underline="hover" color="inherit" href={`/${stepsmap[i].toLowerCase()}`} variant='body2'>{e}</Link>
                        )
                    }
                    <Typography key="3" sx={{ color: 'text.primary' }} variant='subtitle2'>
                        {stepnumber === 0? "Set Up":stepsmap[stepnumber]} 
                    </Typography>
                </Breadcrumbs>
            </div>
            <div className="flex w-[50%] justify-center h-fit">

                <Typography variant='h6' className='py-2'>
                    <b>{stepsmap[stepnumber]} Exercise</b>
                </Typography>

                <Divider className='pt-2'/>
                
            </div>
            <div className='w-[60%] mt-2 mb-3 max-md:w-5/6'>
                    <Stepper activeStep={stepnumber}>
                        {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                        ))}
                    </Stepper>
                </div>
            
        </div>
    )
}

export {Header}