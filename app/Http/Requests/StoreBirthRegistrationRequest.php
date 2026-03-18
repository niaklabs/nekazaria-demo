<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBirthRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'sub_exploitation_id' => ['required', 'exists:sub_exploitations,id'],
            'mother_id' => ['required', 'exists:animals,id'],
            'father_id' => ['nullable', 'exists:animals,id'],
            'birth_type' => ['required', 'in:simple,multiple'],
            'calves' => ['required', 'array', 'min:1', 'max:4'],
            'calves.*.sex' => ['required', 'in:male,female'],
            'calves.*.breed' => ['required', 'string', 'max:255'],
            'calves.*.name' => ['nullable', 'string', 'max:255'],
            'calves.*.birth_date' => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    /**
     * Get custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'sub_exploitation_id.required' => 'Debes seleccionar una subexplotación.',
            'sub_exploitation_id.exists' => 'La subexplotación seleccionada no existe.',
            'mother_id.required' => 'Debes seleccionar la madre.',
            'mother_id.exists' => 'La madre seleccionada no existe.',
            'father_id.exists' => 'El padre seleccionado no existe.',
            'birth_type.required' => 'Debes indicar el tipo de parto.',
            'birth_type.in' => 'El tipo de parto debe ser simple o múltiple.',
            'calves.required' => 'Debes registrar al menos una cría.',
            'calves.min' => 'Debes registrar al menos una cría.',
            'calves.max' => 'No puedes registrar más de 4 crías.',
            'calves.*.sex.required' => 'Debes indicar el sexo de cada cría.',
            'calves.*.sex.in' => 'El sexo debe ser macho o hembra.',
            'calves.*.breed.required' => 'Debes indicar la raza de cada cría.',
            'calves.*.birth_date.required' => 'Debes indicar la fecha de nacimiento.',
            'calves.*.birth_date.before_or_equal' => 'La fecha de nacimiento no puede ser futura.',
        ];
    }
}
