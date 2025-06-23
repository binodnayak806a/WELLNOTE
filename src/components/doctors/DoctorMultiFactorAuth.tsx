import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Shield, 
  Smartphone, 
  Mail, 
  QrCode,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface DoctorMultiFactorAuthProps {
  doctorId: string
  email: string
  phone: string
  onSetupComplete: () => void
  onCancel: () => void
}

export default function DoctorMultiFactorAuth({
  doctorId,
  email,
  phone,
  onSetupComplete,
  onCancel
}: DoctorMultiFactorAuthProps) {
  const [step, setStep] = useState<'methods' | 'setup' | 'verify'>('methods')
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email'>('totp')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [isEnforced, setIsEnforced] = useState(true)

  // Generate QR code and secret
  const generateTOTP = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would call your backend to generate a TOTP secret
      // For demo purposes, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate QR code and secret
      setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/AarogyaSahayak:doctor@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AarogyaSahayak')
      setSecret('JBSWY3DPEHPK3PXP')
      
      setStep('setup')
    } catch (error) {
      console.error('Error generating TOTP:', error)
      toast.error("Failed to generate authentication setup", {
        description: "Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  // Setup SMS or Email MFA
  const setupAlternativeMFA = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would send a verification code
      // For demo purposes, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Verification Code Sent", {
        description: `A verification code has been sent to your ${selectedMethod === 'sms' ? 'phone' : 'email'}`
      })
      
      setStep('verify')
    } catch (error) {
      console.error('Error setting up MFA:', error)
      toast.error("Failed to send verification code", {
        description: "Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  // Verify code
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Invalid Code", {
        description: "Please enter a valid 6-digit verification code"
      })
      return
    }
    
    setLoading(true)
    try {
      // In a real implementation, this would verify the code with your backend
      // For demo purposes, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate successful verification
      if (verificationCode === '123456') {
        toast.success("Verification Successful", {
          description: "Multi-factor authentication has been set up successfully"
        })
        
        onSetupComplete()
      } else {
        toast.error("Invalid Code", {
          description: "The verification code is incorrect. Please try again."
        })
      }
    } catch (error) {
      console.error('Error verifying code:', error)
      toast.error("Failed to verify code", {
        description: "Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  // Start setup process
  const startSetup = () => {
    if (selectedMethod === 'totp') {
      generateTOTP()
    } else {
      setupAlternativeMFA()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-medical-700 bg-medical-50 p-4 rounded-lg border border-medical-200">
        <Shield className="w-6 h-6" />
        <div>
          <h3 className="font-medium">Enhanced Security</h3>
          <p className="text-sm">Multi-factor authentication adds an extra layer of security to protect sensitive patient data.</p>
        </div>
      </div>

      {step === 'methods' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Authentication Method</h3>
            
            <div className="space-y-3">
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${selectedMethod === 'totp' ? 'border-medical-500 bg-medical-50' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedMethod('totp')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full ${selectedMethod === 'totp' ? 'bg-medical-500' : 'border border-gray-300'}`}>
                    {selectedMethod === 'totp' && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <QrCode className="w-5 h-5 mr-2 text-medical-600" />
                      <h4 className="font-medium">Authenticator App (Recommended)</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Use Google Authenticator, Microsoft Authenticator, or any TOTP app
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${selectedMethod === 'sms' ? 'border-medical-500 bg-medical-50' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedMethod('sms')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full ${selectedMethod === 'sms' ? 'bg-medical-500' : 'border border-gray-300'}`}>
                    {selectedMethod === 'sms' && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 mr-2 text-medical-600" />
                      <h4 className="font-medium">SMS Verification</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive verification codes via SMS to {phone || 'your phone'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${selectedMethod === 'email' ? 'border-medical-500 bg-medical-50' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedMethod('email')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full ${selectedMethod === 'email' ? 'bg-medical-500' : 'border border-gray-300'}`}>
                    {selectedMethod === 'email' && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-medical-600" />
                      <h4 className="font-medium">Email Verification</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive verification codes via email to {email || 'your email'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={isEnforced}
              onCheckedChange={setIsEnforced}
              id="enforce-mfa"
            />
            <Label htmlFor="enforce-mfa">Require MFA for every login</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              onClick={startSetup}
              disabled={loading}
              className="bg-medical-600 hover:bg-medical-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'setup' && selectedMethod === 'totp' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Set Up Authenticator App</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50">
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 mb-4"
                />
              )}
              
              {secret && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">If you can't scan the QR code, enter this code manually:</p>
                  <div className="font-mono bg-white p-2 border rounded text-center text-lg tracking-wider">
                    {secret}
                  </div>
                </div>
              )}
            </div>
            
            <ol className="space-y-2 list-decimal list-inside text-sm">
              <li>Download and install an authenticator app like Google Authenticator or Microsoft Authenticator</li>
              <li>Open the app and scan the QR code above</li>
              <li>Enter the 6-digit verification code from the app below</li>
            </ol>
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('methods')}
              disabled={loading}
            >
              Back
            </Button>
            
            <Button
              type="button"
              onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="bg-medical-600 hover:bg-medical-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'verify' && (selectedMethod === 'sms' || selectedMethod === 'email') && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">
            {selectedMethod === 'sms' ? 'SMS Verification' : 'Email Verification'}
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50 text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Verification Code Sent</p>
                  <p className="text-sm">
                    {selectedMethod === 'sms'
                      ? `A 6-digit verification code has been sent to your phone number ending in ${phone.slice(-4)}`
                      : `A 6-digit verification code has been sent to your email address ${email.replace(/(.{2})(.*)(@.*)/, '$1****$3')}`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <p className="text-xs text-gray-500">
                For demo purposes, enter "123456" to simulate successful verification
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('methods')}
              disabled={loading}
            >
              Back
            </Button>
            
            <Button
              type="button"
              onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="bg-medical-600 hover:bg-medical-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}