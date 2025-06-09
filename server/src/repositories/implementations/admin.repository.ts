async getAllUsers(params: { page: number; limit: number; search: string; role: string }): Promise<{ users: IUser[]; total: number; totalPages: number; currentPage: number }> {
    const { page, limit, search, role } = params;
    
    // Build query
    const query: any = {};
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (role) {
        query.role = role;
    }
    
    // Get total count
    const total = await User.countDocuments(query);
    
    // Get users with pagination
    const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    
    return {
        users,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
} 