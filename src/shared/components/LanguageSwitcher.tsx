import { Button, ButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ButtonGroup variant="outlined" size="small">
      <Button
        onClick={() => changeLanguage('en')}
        variant={i18n.language === 'en' ? 'contained' : 'outlined'}
      >
        EN
      </Button>
      <Button
        onClick={() => changeLanguage('es')}
        variant={i18n.language === 'es' ? 'contained' : 'outlined'}
      >
        ES
      </Button>
    </ButtonGroup>
  );
};
