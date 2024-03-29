import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useWallet } from '../../../providers/Wallet'
import {
  verifyGuardianEmail,
  getGuardianEmail,
} from '../../../services/notificationServiceApi'
import { useSubscriptionDetails } from '../../../hooks/useEmailNotifications'
import EmailNotificationsManager from '../../EmailNotifications/EmailNotificationsManager'
import {
  EMAIL_NOTIFICATIONS_FORM_SCREEN,
  NOTIFICATIONS_PREFERENCES_SCREEN,
  UNLOCK_NOTIFICATIONS_SCREEN,
  VERIFICATION_ERROR_SCREEN,
  VERIFICATION_SUCCESS_SCREEN,
  VERIFY_EMAIL_ADDRESS_PREFERENCES,
  LOADING_SCREEN,
} from '../../EmailNotifications/constants'

const NotificationsManager = React.memo(function NotificationsManager({
  onReturnToDashboard,
}) {
  const { account } = useWallet()
  const { search } = useLocation()
  const [startingScreenId, setStartingScreenId] = useState()
  const [guardianNeedsSignature, setGuardianNeedsSignature] = useState()
  const [guardianEmail, setGuardianEmail] = useState('')
  const [fetchingEmail, setFetchingEmail] = useState()

  const {
    emailExists,
    emailVerified,
    notificationsDisabled,
    fetching: fetchingSubscriptionData,
  } = useSubscriptionDetails(account)

  const searchParams = new URLSearchParams(search)
  const address = searchParams.get('address')
  const token = searchParams.get('token')

  useEffect(() => {
    let cancelled = false

    if (!token || !address) {
      return
    }

    const verifyEmailAddress = async () => {
      const { error } = await verifyGuardianEmail(address, token)

      if (!cancelled) {
        if (error) {
          return setStartingScreenId(VERIFICATION_ERROR_SCREEN)
        }
        return setStartingScreenId(VERIFICATION_SUCCESS_SCREEN)
      }
    }

    verifyEmailAddress()
    return () => {
      cancelled = true
    }
  }, [account, address, token])

  useEffect(() => {
    if (token || address) {
      return
    }
    if (!account) {
      return setStartingScreenId(UNLOCK_NOTIFICATIONS_SCREEN)
    }

    if (fetchingSubscriptionData || fetchingEmail) {
      return setStartingScreenId(LOADING_SCREEN)
    }
    if (guardianNeedsSignature) {
      return setStartingScreenId(UNLOCK_NOTIFICATIONS_SCREEN)
    }

    if (!emailVerified && emailExists) {
      return setStartingScreenId(VERIFY_EMAIL_ADDRESS_PREFERENCES)
    }
    if (!emailVerified) {
      return setStartingScreenId(EMAIL_NOTIFICATIONS_FORM_SCREEN)
    }

    if (emailVerified && !guardianNeedsSignature) {
      return setStartingScreenId(NOTIFICATIONS_PREFERENCES_SCREEN)
    }
  }, [
    account,
    emailExists,
    emailVerified,
    fetchingEmail,
    fetchingSubscriptionData,
    guardianNeedsSignature,
    address,
    token,
  ])

  useEffect(() => {
    let cancelled = false
    const getEmail = async () => {
      if (address || token || !account) {
        return
      }
      setFetchingEmail(true)

      if (!cancelled) {
        const { needsSignature, email } = await getGuardianEmail(account)

        setGuardianNeedsSignature(needsSignature)
        setGuardianEmail(email)
        setFetchingEmail(false)
      }
    }
    getEmail()
    return () => {
      cancelled = true
    }
  }, [address, account, token])

  return (
    startingScreenId && (
      <EmailNotificationsManager
        needsUnlockSettings={guardianNeedsSignature}
        emailExists={emailExists}
        emailVerified={emailVerified}
        notificationsDisabled={notificationsDisabled}
        email={guardianEmail}
        startingScreen={startingScreenId}
        onReturnToDashboard={onReturnToDashboard}
      />
    )
  )
})

export default NotificationsManager
