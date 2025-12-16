<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $permissionId = $this->route('permission')->id;

        return [
            'name' => 'required|string|max:255|unique:permissions,name,'.$permissionId,
            'label' => 'required|string|max:255',
            'group' => 'required|string|max:255',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The permission name is required.',
            'name.unique' => 'A permission with this name already exists.',
            'label.required' => 'The permission label is required.',
            'label.max' => 'The label may not be greater than 255 characters.',
            'group.required' => 'The permission group is required.',
            'group.max' => 'The group may not be greater than 255 characters.',
        ];
    }
}
