# CEDT Data Structures & Algorithms

A comprehensive collection of C++ implementations for data structures and algorithms coursework. This repository contains 35+ projects covering fundamental and advanced data structure concepts including binary search trees, heaps, linked lists, vectors, and queues.

## 📋 Overview

This repository serves as a practice and reference collection for data structures and algorithms problems, featuring custom implementations of STL-like containers with additional operations and optimizations.

## 🗂️ Project Structure

```
Data/
├── Binary Search Trees
│   ├── Optimal_Binary.cpp          # Optimal BST construction
│   ├── package_leaves_count/       # Count leaves in BST
│   ├── same_tree_package/          # Tree comparison
│   ├── package_subtree/            # Subtree operations
│   └── unary_node/                 # Unary node handling
│
├── Heaps
│   ├── heap/                       # Basic heap implementation
│   ├── heap_erase.cpp              # Heap with erase operation
│   ├── package_heap_kth/           # K-th element in heap
│   └── package_rank_in_heap/       # Rank operations
│
├── Lists & Linked Lists
│   ├── management.cpp              # List reordering operations
│   ├── package_list_merge/         # List merging
│   ├── splitlist_package/          # List splitting
│   └── lreplace/                   # List replacement
│
├── Vectors
│   ├── vector/                     # Custom vector implementation
│   ├── package_vector_block_swap/  # Block swap operations
│   ├── package_vector_compress/    # Vector compression
│   ├── v_uniq_package/             # Unique elements
│   └── range_insert_package/       # Range insertion
│
├── Queues & Priority Queues
│   ├── package_queue_m2b/          # Move to back operation
│   ├── package_queue_reverse/      # Queue reversal
│   ├── ques_prio/                  # Priority queue
│   └── shift_pack/                 # Queue shifting
│
└── Advanced Problems
    ├── zuma.cpp                    # Zuma game simulation
    ├── d58_q1_erase_many/          # Batch erase operations
    ├── package_insert_many/        # Batch insert operations
    ├── package_deep_push/          # Deep push operations
    ├── package_pair_gte/           # Pair comparison
    ├── ordered_set_package/        # Ordered set operations
    ├── qat_package/                # Query after time
    ├── custom_package/             # Custom data structure
    └── package/                    # General package operations
```

## 🚀 Key Features

- **Custom STL-like Containers**: Implementations of map, list, vector, queue, and priority queue with additional functionality
- **Tree Operations**: BST traversals, optimal tree construction, subtree operations, and leaf counting
- **Heap Algorithms**: K-th element retrieval, rank operations, and custom erase functionality
- **Advanced List Operations**: Reordering, merging, splitting, and batch modifications
- **Vector Optimizations**: Block swapping, compression, and range operations
- **Problem-Solving Implementations**: Real-world algorithm problems and optimizations

## 💻 Technologies

- **Language**: C++
- **Standard**: C++11 and above
- **Paradigm**: Template-based generic programming
- **Concepts**: OOP, iterators, memory management

## 📚 Topics Covered

### Data Structures
- Binary Search Trees (BST)
- Heaps & Priority Queues
- Doubly Linked Lists
- Dynamic Arrays (Vectors)
- Queues & Deques
- Maps & Ordered Sets

### Algorithms
- Tree Traversals (Preorder, Inorder, Postorder)
- Heap Operations (Heapify, Extract, Insert)
- Sorting & Searching
- Range Queries
- Batch Operations
- Memory Management & Optimization

## 🔧 Building & Running

### Prerequisites
- C++ compiler with C++11 support (g++, clang++)
- Standard Template Library (STL)

### Compilation

For standalone files:
```bash
g++ -std=c++11 -o output_file Data/filename.cpp
./output_file
```

For package directories:
```bash
g++ -std=c++11 -o output_file Data/package_name/*.cpp
./output_file
```

### Example
```bash
# Compile and run optimal binary tree
g++ -std=c++11 -o optimal Data/Optimal_Binary.cpp
./optimal

# Compile management list operations
g++ -std=c++11 -o management Data/management.cpp
./management
```

## 📖 Usage Examples

### Binary Search Tree
```cpp
CP::map_bst<int, int> bst;
bst[5] = 100;
bst.insert(std::make_pair(3, 50));
bst.print_key_inorder();  // Prints keys in sorted order
```

### Custom List Reordering
```cpp
CP::list<std::string> l;
l.push_back("A");
l.push_back("B");
l.push_back("C");
std::vector<int> selected = {0, 2};
l.reorder(1, selected);  // Reorder selected elements
```

## 🎯 Learning Objectives

- Implement complex data structures from scratch
- Understand STL container internals
- Master template programming in C++
- Optimize time and space complexity
- Practice algorithmic problem-solving
- Develop memory management skills

## 📝 Notes

- Each package typically contains:
  - `main.cpp`: Test driver program
  - `student.h`: Student implementation file
  - Data structure header files (e.g., `map_bst.h`, `queue.h`, `vector.h`)
- Most implementations use custom namespaces (e.g., `CP::`) to avoid conflicts with STL
- Parent pointers are maintained in tree structures for efficient traversal
- Iterator patterns follow STL conventions

## 🤝 Contributing

This is a personal coursework repository. Feel free to explore and learn from the implementations.

## 📄 License

Educational purposes only.

## 👤 Author

CEDT Student Repository

---

**Note**: This repository contains solutions and implementations for data structures coursework. Each problem demonstrates different aspects of data structure design and algorithm optimization.
