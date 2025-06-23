import React, { useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  GraduationCap, 
  Award, 
  Languages, 
  Plus, 
  Trash2, 
  Save,
  Loader2
} from 'lucide-react'

// Validation schema
const qualificationsSchema = z.object({
  registrationNumber: z.string().min(1, 'Medical registration number is required'),
  registrationCouncil: z.string().min(1, 'Registration council is required'),
  registrationYear: z.string().min(1, 'Registration year is required'),
  qualifications: z.array(z.object({
    degree: z.string().min(1, 'Degree is required'),
    institution: z.string().min(1, 'Institution is required'),
    year: z.string().min(1, 'Year is required')
  })).min(1, 'At least one qualification is required'),
  specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  bio: z.string().optional()
})

type QualificationsForm = z.infer<typeof qualificationsSchema>

// Specializations list
const specializations = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Medicine',
  'General Surgery', 'Gynecology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Otolaryngology', 'Pediatrics', 'Psychiatry', 'Pulmonology',
  'Radiology', 'Urology', 'Nephrology', 'Rheumatology', 'Hematology'
]

// Languages list
const languages = [
  'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu',
  'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 'Sanskrit'
]

// Registration councils
const registrationCouncils = [
  'Medical Council of India (MCI)',
  'National Medical Commission (NMC)',
  'State Medical Council',
  'Dental Council of India',
  'Indian Nursing Council',
  'Pharmacy Council of India',
  'Other'
]

interface DoctorQualificationsFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function DoctorQualificationsForm({
  initialData,
  onSubmit,
  onCancel
}: DoctorQualificationsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<QualificationsForm>({
    resolver: zodResolver(qualificationsSchema),
    defaultValues: initialData ? {
      registrationNumber: initialData.registration_number || '',
      registrationCouncil: initialData.registration_council || '',
      registrationYear: initialData.registration_year || '',
      qualifications: initialData.qualifications || [{ degree: '', institution: '', year: '' }],
      specializations: initialData.specializations || [],
      experience: initialData.experience || 0,
      languages: initialData.languages || [],
      bio: initialData.bio || ''
    } : {
      qualifications: [{ degree: '', institution: '', year: '' }],
      specializations: [],
      languages: [],
      experience: 0
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'qualifications'
  })

  // Submit form
  const submitForm = async (data: QualificationsForm) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        registration_number: data.registrationNumber,
        registration_council: data.registrationCouncil,
        registration_year: data.registrationYear,
        qualifications: data.qualifications,
        specializations: data.specializations,
        experience: data.experience,
        languages: data.languages,
        bio: data.bio
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Medical Registration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input
              id="registrationNumber"
              {...register('registrationNumber')}
              placeholder="Enter registration number"
            />
            {errors.registrationNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.registrationNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="registrationCouncil">Registration Council *</Label>
            <Controller
              name="registrationCouncil"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select council" />
                  </SelectTrigger>
                  <SelectContent>
                    {registrationCouncils.map((council) => (
                      <SelectItem key={council} value={council}>
                        {council}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.registrationCouncil && (
              <p className="text-sm text-red-600 mt-1">{errors.registrationCouncil.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="registrationYear">Registration Year *</Label>
            <Input
              id="registrationYear"
              {...register('registrationYear')}
              placeholder="YYYY"
              maxLength={4}
            />
            {errors.registrationYear && (
              <p className="text-sm text-red-600 mt-1">{errors.registrationYear.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Qualifications
          </h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => append({ degree: '', institution: '', year: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Qualification
          </Button>
        </div>
        
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
            <div>
              <Label htmlFor={`qualifications.${index}.degree`}>Degree *</Label>
              <Input
                id={`qualifications.${index}.degree`}
                {...register(`qualifications.${index}.degree`)}
                placeholder="e.g., MBBS, MD, MS"
              />
              {errors.qualifications?.[index]?.degree && (
                <p className="text-sm text-red-600 mt-1">{errors.qualifications[index]?.degree?.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor={`qualifications.${index}.institution`}>Institution *</Label>
              <Input
                id={`qualifications.${index}.institution`}
                {...register(`qualifications.${index}.institution`)}
                placeholder="Enter institution name"
              />
              {errors.qualifications?.[index]?.institution && (
                <p className="text-sm text-red-600 mt-1">{errors.qualifications[index]?.institution?.message}</p>
              )}
            </div>
            
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor={`qualifications.${index}.year`}>Year *</Label>
                <Input
                  id={`qualifications.${index}.year`}
                  {...register(`qualifications.${index}.year`)}
                  placeholder="YYYY"
                  maxLength={4}
                />
                {errors.qualifications?.[index]?.year && (
                  <p className="text-sm text-red-600 mt-1">{errors.qualifications[index]?.year?.message}</p>
                )}
              </div>
              
              {fields.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Specializations & Experience
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="specializations">Specializations *</Label>
            <Controller
              name="specializations"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => {
                    const currentValues = field.value || []
                    if (!currentValues.includes(value)) {
                      field.onChange([...currentValues, value])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((specialization) => (
                      <SelectItem key={specialization} value={specialization}>
                        {specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {watch('specializations')?.map((specialization, index) => (
                <div 
                  key={index} 
                  className="bg-medical-100 text-medical-800 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {specialization}
                  <button
                    type="button"
                    className="ml-2 text-medical-600 hover:text-medical-800"
                    onClick={() => {
                      const currentValues = watch('specializations') || []
                      setValue('specializations', currentValues.filter(s => s !== specialization))
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {errors.specializations && (
              <p className="text-sm text-red-600 mt-1">{errors.specializations.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="languages">Languages *</Label>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => {
                    const currentValues = field.value || []
                    if (!currentValues.includes(value)) {
                      field.onChange([...currentValues, value])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select languages" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {watch('languages')?.map((language, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {language}
                  <button
                    type="button"
                    className="ml-2 text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      const currentValues = watch('languages') || []
                      setValue('languages', currentValues.filter(l => l !== language))
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {errors.languages && (
              <p className="text-sm text-red-600 mt-1">{errors.languages.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experience">Years of Experience *</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              step="1"
              {...register('experience', { valueAsNumber: true })}
              placeholder="Enter years of experience"
            />
            {errors.experience && (
              <p className="text-sm text-red-600 mt-1">{errors.experience.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Enter professional biography"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-medical-600 hover:bg-medical-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Qualifications
            </>
          )}
        </Button>
      </div>
    </form>
  )
}