import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '@/i18n'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useLocale()

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Result
        status="404"
        title="404"
        subTitle={t('notFound.subtitle')}
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            {t('notFound.backHome')}
          </Button>
        }
      />
    </div>
  )
}
