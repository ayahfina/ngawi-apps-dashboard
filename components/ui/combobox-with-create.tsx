"use client"

import { useState, useEffect } from "react"
import { Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Option {
  value: string
  label: string
  description?: string
}

interface ComboboxWithCreateProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  createDialogTitle: string
  createDialogDescription: string
  createApiEndpoint: string
  createFields: Array<{
    name: string
    label: string
    type: "text" | "textarea"
    placeholder?: string
    required?: boolean
  }>
  disabled?: boolean
  className?: string
}

export function ComboboxWithCreate({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  emptyMessage = "Tidak ada opsi ditemukan.",
  createDialogTitle,
  createDialogDescription,
  createApiEndpoint,
  createFields,
  disabled = false,
  className,
}: ComboboxWithCreateProps) {
  const [open, setOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [createLoading, setCreateLoading] = useState(false)
  const [newOptionData, setNewOptionData] = useState<Record<string, string>>({})
  const [refreshKey, setRefreshKey] = useState(0)

  // Initialize new option data with empty values
  useEffect(() => {
    const initialData: Record<string, string> = {}
    createFields.forEach((field) => {
      initialData[field.name] = ""
    })
    setNewOptionData(initialData)
  }, [createFields])

  const selectedOption = options.find((option) => option.value === value)

  const handleCreateNew = async () => {
    // Validate required fields
    const missingFields = createFields.filter((field) => field.required && !newOptionData[field.name]?.trim())
    if (missingFields.length > 0) {
      toast.error(`Harap lengkapi field: ${missingFields.map(f => f.label).join(", ")}`)
      return
    }

    setCreateLoading(true)
    try {
      const response = await fetch(createApiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOptionData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Berhasil menambahkan data baru")

        // Set the newly created option as selected
        onChange(data.data.id.toString())

        // Close dialogs
        setCreateDialogOpen(false)
        setOpen(false)

        // Clear form data
        const clearedData: Record<string, string> = {}
        createFields.forEach((field) => {
          clearedData[field.name] = ""
        })
        setNewOptionData(clearedData)

        // Trigger refresh of parent component
        setRefreshKey(prev => prev + 1)
      } else {
        const error = await response.json()
        toast.error(error.error || "Gagal menambahkan data")
      }
    } catch (error) {
      console.error("Error creating new option:", error)
      toast.error("Terjadi kesalahan saat menambahkan data")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setNewOptionData((prev) => ({ ...prev, [fieldName]: value }))
  }

  const resetCreateForm = () => {
    const clearedData: Record<string, string> = {}
    createFields.forEach((field) => {
      clearedData[field.name] = ""
    })
    setNewOptionData(clearedData)
  }

  return (
    <div key={refreshKey}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", disabled && "opacity-50", className)}
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Cari opsi..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">{emptyMessage}</p>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault()
                          setCreateDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah {createDialogTitle.toLowerCase()}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Tambah {createDialogTitle}</DialogTitle>
                        <DialogDescription>
                          {createDialogDescription}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {createFields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {field.type === "textarea" ? (
                              <Textarea
                                id={field.name}
                                placeholder={field.placeholder}
                                value={newOptionData[field.name] || ""}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                rows={3}
                              />
                            ) : (
                              <Input
                                id={field.name}
                                placeholder={field.placeholder}
                                value={newOptionData[field.name] || ""}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCreateDialogOpen(false)
                            resetCreateForm()
                          }}
                        >
                          Batal
                        </Button>
                        <Button onClick={handleCreateNew} disabled={createLoading}>
                          {createLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                      setSearchValue("")
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div>{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  value="__create_new__"
                  onSelect={() => {
                    setCreateDialogOpen(true)
                  }}
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah {createDialogTitle.toLowerCase()} baru...
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Standalone Create Dialog for when user explicitly clicks the button */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah {createDialogTitle}</DialogTitle>
            <DialogDescription>
              {createDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {createFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={newOptionData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    value={newOptionData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                resetCreateForm()
              }}
            >
              Batal
            </Button>
            <Button onClick={handleCreateNew} disabled={createLoading}>
              {createLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}